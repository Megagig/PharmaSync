import Patient from '../models/patient.model';
import Medication from '../models/medication.model';
import Prescription from '../models/prescription.model';
import Dispensing from '../models/dispensing.model';
import { calculateAge } from '../utils/date.utils';

/**
 * Get patient demographics report
 * @param startDate Optional start date for filtering
 * @param endDate Optional end date for filtering
 * @returns Patient demographics statistics
 */
export const getPatientDemographicsReport = async (
  startDate?: Date,
  endDate?: Date
) => {
  // Build query based on date range
  const query: any = {};

  if (startDate || endDate) {
    query.createdAt = {};

    if (startDate) {
      query.createdAt.$gte = startDate;
    }

    if (endDate) {
      query.createdAt.$lte = endDate;
    }
  }

  // Get all patients within the date range
  const patients = await Patient.find(query);

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

  // Calculate blood group distribution
  const bloodGroupDistribution: { [key: string]: number } = {};
  patients.forEach((patient) => {
    if (patient.bloodGroup) {
      bloodGroupDistribution[patient.bloodGroup] =
        (bloodGroupDistribution[patient.bloodGroup] || 0) + 1;
    }
  });

  // Calculate genotype distribution
  const genotypeDistribution: { [key: string]: number } = {};
  patients.forEach((patient) => {
    if (patient.genotype) {
      genotypeDistribution[patient.genotype] =
        (genotypeDistribution[patient.genotype] || 0) + 1;
    }
  });

  // Calculate marital status distribution
  const maritalStatusDistribution: { [key: string]: number } = {};
  patients.forEach((patient) => {
    if (patient.maritalStatus) {
      maritalStatusDistribution[patient.maritalStatus] =
        (maritalStatusDistribution[patient.maritalStatus] || 0) + 1;
    }
  });

  return {
    totalPatients,
    genderDistribution,
    ageDistribution,
    bloodGroupDistribution,
    genotypeDistribution,
    maritalStatusDistribution,
  };
};

/**
 * Get medication usage report
 * @param startDate Optional start date for filtering
 * @param endDate Optional end date for filtering
 * @returns Medication usage statistics
 */
export const getMedicationUsageReport = async (
  startDate?: Date,
  endDate?: Date
) => {
  // Build query based on date range
  const query: any = {};

  if (startDate || endDate) {
    query.createdAt = {};

    if (startDate) {
      query.createdAt.$gte = startDate;
    }

    if (endDate) {
      query.createdAt.$lte = endDate;
    }
  }

  // Get all prescriptions within the date range
  const prescriptions = await Prescription.find(query)
    .populate('items.medication')
    .populate({
      path: 'patient',
      select: 'firstName lastName dateOfBirth gender',
    });

  // Get all dispensings within the date range
  const dispensings = await Dispensing.find(query)
    .populate('items.medication')
    .populate({
      path: 'patient',
      select: 'firstName lastName dateOfBirth gender',
    });

  // Calculate total prescriptions and dispensings
  const totalPrescriptions = prescriptions.length;
  const totalDispensings = dispensings.length;

  // Calculate medication frequency
  const medicationFrequency: { [key: string]: number } = {};
  const medicationsByCategory: { [key: string]: number } = {};
  const medicationsByPatientAge: { [key: string]: { [key: string]: number } } =
    {
      children: {}, // 0-18
      youngAdults: {}, // 19-35
      middleAged: {}, // 36-50
      seniors: {}, // 51-65
      elderly: {}, // 65+
    };

  // Process prescriptions
  prescriptions.forEach((prescription) => {
    if (prescription.items && Array.isArray(prescription.items)) {
      prescription.items.forEach((item: any) => {
        if (item.medication) {
          const medicationName = item.medication.name;
          const medicationCategory =
            item.medication.category || 'Uncategorized';

          // Update medication frequency
          medicationFrequency[medicationName] =
            (medicationFrequency[medicationName] || 0) + 1;

          // Update medications by category
          medicationsByCategory[medicationCategory] =
            (medicationsByCategory[medicationCategory] || 0) + 1;

          // Update medications by patient age
          const patientObj = prescription.patient as any;
          if (
            patientObj &&
            typeof patientObj === 'object' &&
            patientObj.dateOfBirth
          ) {
            const age = calculateAge(new Date(patientObj.dateOfBirth));
            let ageGroup = 'elderly';

            if (age <= 18) {
              ageGroup = 'children';
            } else if (age <= 35) {
              ageGroup = 'youngAdults';
            } else if (age <= 50) {
              ageGroup = 'middleAged';
            } else if (age <= 65) {
              ageGroup = 'seniors';
            }

            if (!medicationsByPatientAge[ageGroup]) {
              medicationsByPatientAge[ageGroup] = {};
            }

            medicationsByPatientAge[ageGroup][medicationName] =
              (medicationsByPatientAge[ageGroup][medicationName] || 0) + 1;
          }
        }
      });
    }
  });

  // Calculate average medications per prescription
  const totalMedicationsInPrescriptions = prescriptions.reduce(
    (total, prescription) =>
      total + (prescription.items ? prescription.items.length : 0),
    0
  );
  const avgMedicationsPerPrescription =
    totalPrescriptions > 0
      ? totalMedicationsInPrescriptions / totalPrescriptions
      : 0;

  // Format medication frequency for chart display
  const topMedications = Object.entries(medicationFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Format medications by category for chart display
  const medicationCategories = Object.entries(medicationsByCategory).map(
    ([name, count]) => ({ name, count })
  );

  return {
    totalPrescriptions,
    totalDispensings,
    avgMedicationsPerPrescription,
    topMedications,
    medicationCategories,
    medicationsByPatientAge,
  };
};

/**
 * Get drug therapy problem report
 * @param startDate Optional start date for filtering
 * @param endDate Optional end date for filtering
 * @returns Drug therapy problem statistics
 */
export const getDrugTherapyProblemReport = async (
  startDate?: Date,
  endDate?: Date
) => {
  // Build query based on date range
  const query: any = {};

  if (startDate || endDate) {
    query.createdAt = {};

    if (startDate) {
      query.createdAt.$gte = startDate;
    }

    if (endDate) {
      query.createdAt.$lte = endDate;
    }
  }

  // Get all patients within the date range
  const patients = await Patient.find(query);

  // Calculate drug therapy problem statistics
  let totalDTPs = 0;
  let resolvedDTPs = 0;
  let inProgressDTPs = 0;
  let unresolvedDTPs = 0;

  const dtpCategories: { [key: string]: number } = {};
  const dtpByAgeGroup: { [key: string]: number } = {
    children: 0, // 0-18
    youngAdults: 0, // 19-35
    middleAged: 0, // 36-50
    seniors: 0, // 51-65
    elderly: 0, // 65+
  };

  patients.forEach((patient) => {
    if (patient.drugTherapyProblems && patient.drugTherapyProblems.length > 0) {
      totalDTPs += patient.drugTherapyProblems.length;

      patient.drugTherapyProblems.forEach((dtp: any) => {
        // Count by status
        const status = (dtp as any).status || 'unresolved';
        if (status === 'resolved') {
          resolvedDTPs++;
        } else if (status === 'in-progress') {
          inProgressDTPs++;
        } else {
          unresolvedDTPs++;
        }

        // Count by category
        const category =
          (dtp as any).category || dtp.problem || 'Uncategorized';
        dtpCategories[category] = (dtpCategories[category] || 0) + 1;

        // Count by age group
        const age = calculateAge(new Date(patient.dateOfBirth));
        if (age <= 18) {
          dtpByAgeGroup.children++;
        } else if (age <= 35) {
          dtpByAgeGroup.youngAdults++;
        } else if (age <= 50) {
          dtpByAgeGroup.middleAged++;
        } else if (age <= 65) {
          dtpByAgeGroup.seniors++;
        } else {
          dtpByAgeGroup.elderly++;
        }
      });
    }
  });

  // Format DTP categories for chart display
  const dtpCategoriesChart = Object.entries(dtpCategories).map(
    ([name, count]) => ({ name, count })
  );

  // Calculate resolution rate
  const resolutionRate = totalDTPs > 0 ? (resolvedDTPs / totalDTPs) * 100 : 0;

  return {
    totalDTPs,
    resolvedDTPs,
    inProgressDTPs,
    unresolvedDTPs,
    resolutionRate,
    dtpCategoriesChart,
    dtpByAgeGroup,
  };
};

/**
 * Get patient outcomes report
 * @param startDate Optional start date for filtering
 * @param endDate Optional end date for filtering
 * @returns Patient outcomes statistics
 */
export const getPatientOutcomesReport = async (
  startDate?: Date,
  endDate?: Date
) => {
  // Build query based on date range
  const query: any = {};

  if (startDate || endDate) {
    query.createdAt = {};

    if (startDate) {
      query.createdAt.$gte = startDate;
    }

    if (endDate) {
      query.createdAt.$lte = endDate;
    }
  }

  // Get all patients within the date range
  const patients = await Patient.find(query);

  // Calculate care plan statistics
  let totalCarePlans = 0;
  let completedCarePlans = 0;
  let inProgressCarePlans = 0;

  // Calculate SOAP note statistics
  let totalSoapNotes = 0;
  let followUpCompleted = 0;
  let followUpScheduled = 0;

  patients.forEach((patient) => {
    // Process care plans
    if (patient.carePlans && patient.carePlans.length > 0) {
      totalCarePlans += patient.carePlans.length;

      patient.carePlans.forEach((plan: any) => {
        if (plan.status === 'completed') {
          completedCarePlans++;
        } else if (plan.status === 'in-progress') {
          inProgressCarePlans++;
        }
      });
    }

    // Process SOAP notes
    if (patient.soapNotes && patient.soapNotes.length > 0) {
      totalSoapNotes += patient.soapNotes.length;

      patient.soapNotes.forEach((note: any) => {
        if (note.followUpCompleted) {
          followUpCompleted++;
        } else if (note.followUpDate) {
          followUpScheduled++;
        }
      });
    }
  });

  // Calculate completion rates
  const carePlanCompletionRate =
    totalCarePlans > 0 ? (completedCarePlans / totalCarePlans) * 100 : 0;
  const followUpCompletionRate =
    followUpCompleted + followUpScheduled > 0
      ? (followUpCompleted / (followUpCompleted + followUpScheduled)) * 100
      : 0;

  return {
    carePlans: {
      total: totalCarePlans,
      completed: completedCarePlans,
      inProgress: inProgressCarePlans,
      completionRate: carePlanCompletionRate,
    },
    soapNotes: {
      total: totalSoapNotes,
      followUpCompleted,
      followUpScheduled,
      followUpCompletionRate,
    },
  };
};
