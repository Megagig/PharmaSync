import Patient from '../models/patient.model';
import Medication from '../models/medication.model';
import { calculateAge } from '../utils/date.utils';

export const getDashboardStats = async (
  startDate?: string,
  endDate?: string
) => {
  // Build query based on date range
  const query: any = {};

  if (startDate || endDate) {
    query.createdAt = {};

    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }

    if (endDate) {
      // Set the end date to the end of the day
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      query.createdAt.$lte = endDateTime;
    }
  }

  // Get all patients within the date range
  const patients = await Patient.find(query).populate('medications');

  // Get medications with the same date range if applicable
  const medicationQuery = startDate || endDate ? { ...query } : {};
  const medications = await Medication.find(medicationQuery);

  // Calculate total patients
  const totalPatients = patients.length;

  // Calculate gender distribution
  const genderDistribution = {
    male: patients.filter((patient) => patient.gender === 'male').length,
    female: patients.filter((patient) => patient.gender === 'female').length,
    other: patients.filter((patient) => patient.gender === 'other').length,
  };

  // Calculate age distribution
  const ageDistribution = {
    children: 0, // 0-18
    youngAdults: 0, // 19-35
    middleAged: 0, // 36-50
    seniors: 0, // 51-65
    elderly: 0, // 65+
  };

  patients.forEach((patient) => {
    const age = calculateAge(new Date(patient.dateOfBirth));
    if (age <= 18) {
      ageDistribution.children++;
    } else if (age <= 35) {
      ageDistribution.youngAdults++;
    } else if (age <= 50) {
      ageDistribution.middleAged++;
    } else if (age <= 65) {
      ageDistribution.seniors++;
    } else {
      ageDistribution.elderly++;
    }
  });

  // Calculate records distribution
  const recordsDistribution = {
    withAllergies: patients.filter(
      (patient) => patient.allergies && patient.allergies.length > 0
    ).length,
    withMedicalConditions: patients.filter(
      (patient) =>
        patient.medicalConditions && patient.medicalConditions.length > 0
    ).length,
    withMedicationHistory: patients.filter(
      (patient) =>
        patient.medicationHistory && patient.medicationHistory.length > 0
    ).length,
    withClinicalAssessments: patients.filter(
      (patient) =>
        patient.clinicalAssessments && patient.clinicalAssessments.length > 0
    ).length,
    withLaboratoryFindings: patients.filter(
      (patient) =>
        patient.laboratoryFindings && patient.laboratoryFindings.length > 0
    ).length,
    withDrugTherapyProblems: patients.filter(
      (patient) =>
        patient.drugTherapyProblems && patient.drugTherapyProblems.length > 0
    ).length,
    withCarePlans: patients.filter(
      (patient) => patient.carePlans && patient.carePlans.length > 0
    ).length,
    withSoapNotes: patients.filter(
      (patient) => patient.soapNotes && patient.soapNotes.length > 0
    ).length,
  };

  // Get upcoming follow-ups
  const upcomingFollowUps: Array<{
    patientId: string;
    patientName: string;
    date: string;
    type: string;
  }> = [];

  // Get follow-ups from care plans
  patients.forEach((patient) => {
    if (patient.carePlans && patient.carePlans.length > 0) {
      patient.carePlans.forEach((plan) => {
        if (plan.followUpDate) {
          const followUpDate = new Date(plan.followUpDate);
          const today = new Date();
          const thirtyDaysLater = new Date();
          thirtyDaysLater.setDate(today.getDate() + 30);

          // Only include follow-ups in the next 30 days
          if (followUpDate > today && followUpDate <= thirtyDaysLater) {
            upcomingFollowUps.push({
              patientId: patient._id.toString(),
              patientName: `${patient.firstName} ${patient.lastName}`,
              date: followUpDate.toISOString(),
              type: 'Care Plan',
            });
          }
        }
      });
    }
  });

  // Sort follow-ups by date
  upcomingFollowUps.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Get recent activities
  const recentActivities: Array<{
    type: string;
    date: string;
    patientId: string;
    patientName: string;
    description: string;
  }> = [];

  // Add recent patient additions
  const recentPatients = await Patient.find().sort({ createdAt: -1 }).limit(5);

  recentPatients.forEach((patient) => {
    recentActivities.push({
      type: 'patient_added',
      date: patient.createdAt.toISOString(),
      patientId: patient._id.toString(),
      patientName: `${patient.firstName} ${patient.lastName}`,
      description: 'Added new patient',
    });
  });

  // Add recent medication history additions
  patients.forEach((patient) => {
    if (patient.medicationHistory && patient.medicationHistory.length > 0) {
      // Sort by date if available
      const sortedMedicationHistory = [...patient.medicationHistory].sort(
        (a, b) => {
          const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
          const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
          return dateB - dateA;
        }
      );

      const recentMedication = sortedMedicationHistory[0];

      if (recentMedication && recentMedication.startDate) {
        const startDate = new Date(recentMedication.startDate);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        if (startDate > thirtyDaysAgo) {
          recentActivities.push({
            type: 'medication_added',
            date: startDate.toISOString(),
            patientId: patient._id.toString(),
            patientName: `${patient.firstName} ${patient.lastName}`,
            description: 'Added medication history for',
          });
        }
      }
    }
  });

  // Sort activities by date
  recentActivities.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Limit to 10 most recent activities
  const limitedActivities = recentActivities.slice(0, 10);

  // Calculate medication statistics
  const medicationStats = {
    categoriesDistribution: [] as Array<{ name: string; count: number }>,
    frequentMedications: [] as Array<{ name: string; count: number }>,
  };

  // Get medication categories distribution
  const categories = new Map<string, number>();
  medications.forEach((medication) => {
    const category = medication.category || 'Uncategorized';
    categories.set(category, (categories.get(category) || 0) + 1);
  });

  categories.forEach((count, name) => {
    medicationStats.categoriesDistribution.push({ name, count });
  });

  // Sort categories by count
  medicationStats.categoriesDistribution.sort((a, b) => b.count - a.count);

  // Get most frequent medications
  const medicationCounts = new Map<string, number>();
  patients.forEach((patient) => {
    if (patient.medicationHistory && patient.medicationHistory.length > 0) {
      patient.medicationHistory.forEach((med) => {
        // Use type assertion to handle different medication field types
        const medicationObj = med.medication as any;
        let medicationName = 'Unknown Medication';

        if (medicationObj) {
          if (typeof medicationObj === 'object' && medicationObj.name) {
            medicationName = medicationObj.name;
          } else if (typeof medicationObj === 'string') {
            medicationName = 'Medication ' + medicationObj.substring(0, 5);
          }
        }

        medicationCounts.set(
          medicationName,
          (medicationCounts.get(medicationName) || 0) + 1
        );
      });
    }
  });

  medicationCounts.forEach((count, name) => {
    medicationStats.frequentMedications.push({ name, count });
  });

  // Sort medications by frequency
  medicationStats.frequentMedications.sort((a, b) => b.count - a.count);

  // Limit to top 10 medications
  medicationStats.frequentMedications =
    medicationStats.frequentMedications.slice(0, 10);

  // Calculate drug therapy problem statistics
  const dtpStats = {
    totalDTPs: 0,
    resolvedDTPs: 0,
    inProgressDTPs: 0,
    unresolvedDTPs: 0,
    categoriesDistribution: [] as Array<{ name: string; count: number }>,
  };

  // Count DTPs by status and category
  const dtpCategories = new Map<string, number>();

  patients.forEach((patient) => {
    if (patient.drugTherapyProblems && patient.drugTherapyProblems.length > 0) {
      dtpStats.totalDTPs += patient.drugTherapyProblems.length;

      patient.drugTherapyProblems.forEach((dtp) => {
        // Count by status - using a default status if not available
        const status = (dtp as any).status || 'unresolved';
        if (status === 'resolved') {
          dtpStats.resolvedDTPs++;
        } else if (status === 'in-progress') {
          dtpStats.inProgressDTPs++;
        } else {
          dtpStats.unresolvedDTPs++;
        }

        // Count by category - using a default category if not available
        const dtpAny = dtp as any;
        const category = dtpAny.category || dtpAny.problem || 'Uncategorized';
        dtpCategories.set(category, (dtpCategories.get(category) || 0) + 1);
      });
    }
  });

  dtpCategories.forEach((count, name) => {
    dtpStats.categoriesDistribution.push({ name, count });
  });

  // Sort categories by count
  dtpStats.categoriesDistribution.sort((a, b) => b.count - a.count);

  return {
    totalPatients,
    genderDistribution,
    ageDistribution,
    recordsDistribution,
    upcomingFollowUps,
    recentActivities: limitedActivities,
    medicationStats,
    dtpStats,
  };
};
