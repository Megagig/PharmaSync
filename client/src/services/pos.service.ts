const PosService = {
  getProducts: async () => ({
    data: [
      {
        id: '1',
        name: 'Pain Reliever',
        price: 12.99,
        sku: 'PR-001',
        stock: 100,
      },
      {
        id: '2',
        name: 'Antibiotic',
        price: 24.99,
        sku: 'AB-002',
        stock: 50,
      },
    ],
  }),
};

export default PosService;
