// Quick diagnostic: verify exported methods from PhieuSuaDiemModel
try {
  const model = require('./src/models/PhieuSuaDiemModel');
  console.log('PhieuSuaDiemModel keys:', Object.keys(model));
  console.log('is class?', typeof model === 'function');
  if (typeof model === 'function') {
    const staticKeys = Object.getOwnPropertyNames(model).filter(k => typeof model[k] !== 'undefined');
    console.log('Class static keys:', staticKeys);
    console.log('has findAll:', typeof model.findAll === 'function');
    console.log('has updateStatus:', typeof model.updateStatus === 'function');
  }
} catch (err) {
  console.error('Error requiring model:', err);
}
