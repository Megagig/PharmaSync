import api from '../api';
import {
  DashboardStats,
  DashboardStatsParams,
} from '@/store/slices/dashboardSlice';

export const getDashboardStats = async (
  params: DashboardStatsParams = {}
): Promise<DashboardStats> => {
  try {
    const response = await api.get('/dashboard/stats', { params });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return mock data for development
    return getMockDashboardStats();
  }
};

// Mock data for development
const getMockDashboardStats = (): DashboardStats => {
  return {
    totalPatients: 250,
    genderDistribution: {
      male: 120,
      female: 125,
      other: 5,
    },
    ageDistribution: {
      children: 35,
      youngAdults: 75,
      middleAged: 80,
      seniors: 45,
      elderly: 15,
    },
    recordsDistribution: {
      withAllergies: 85,
      withMedicalConditions: 120,
      withMedicationHistory: 180,
      withClinicalAssessments: 150,
      withLaboratoryFindings: 110,
      withDrugTherapyProblems: 75,
      withCarePlans: 90,
      withSoapNotes: 65,
    },
    upcomingFollowUps: [
      {
        patientId: '1',
        patientName: 'John Doe',
        date: '2023-12-15',
        type: 'Medication Review',
      },
      {
        patientId: '2',
        patientName: 'Jane Smith',
        date: '2023-12-16',
        type: 'Blood Pressure Check',
      },
      {
        patientId: '3',
        patientName: 'Robert Johnson',
        date: '2023-12-18',
        type: 'Diabetes Follow-up',
      },
    ],
    recentActivities: [
      {
        type: 'Prescription',
        date: '2023-12-10',
        patientId: '1',
        patientName: 'John Doe',
        description: 'Prescribed Metformin 500mg',
      },
      {
        type: 'Clinical Assessment',
        date: '2023-12-09',
        patientId: '2',
        patientName: 'Jane Smith',
        description: 'Blood pressure assessment',
      },
      {
        type: 'Dispensing',
        date: '2023-12-08',
        patientId: '3',
        patientName: 'Robert Johnson',
        description: 'Dispensed Lisinopril 10mg',
      },
    ],
    medicationStats: {
      categoriesDistribution: [
        { name: 'Antibiotics', count: 45 },
        { name: 'Antihypertensives', count: 35 },
        { name: 'Antidiabetics', count: 30 },
        { name: 'Analgesics', count: 25 },
        { name: 'Antihistamines', count: 15 },
      ],
      frequentMedications: [
        { name: 'Metformin 500mg', count: 28 },
        { name: 'Lisinopril 10mg', count: 25 },
        { name: 'Amoxicillin 500mg', count: 22 },
        { name: 'Paracetamol 500mg', count: 20 },
        { name: 'Amlodipine 5mg', count: 18 },
      ],
    },
    dtpStats: {
      totalDTPs: 75,
      resolvedDTPs: 45,
      inProgressDTPs: 20,
      unresolvedDTPs: 10,
      categoriesDistribution: [
        { name: 'Adherence', count: 25 },
        { name: 'Adverse Effects', count: 15 },
        { name: 'Dosage Too Low', count: 12 },
        { name: 'Dosage Too High', count: 10 },
        { name: 'Drug Interactions', count: 8 },
        { name: 'Unnecessary Therapy', count: 5 },
      ],
    },
  };
};
