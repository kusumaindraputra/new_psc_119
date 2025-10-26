require('dotenv').config();
const { sequelize, User, MasterCategory, MasterUnit, MasterVehicle } = require('../models');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Create admin user
    const admin = await User.create({
      name: 'Admin PSC 119',
      email: 'admin@psc119.id',
      phone: '081234567890',
      password_hash: 'admin123',
      role: 'admin'
    });
    console.log('✅ Admin user created');

    // Create dispatcher
    const dispatcher = await User.create({
      name: 'Dispatcher 1',
      email: 'dispatcher@psc119.id',
      phone: '081234567891',
      password_hash: 'dispatcher123',
      role: 'dispatcher'
    });
    console.log('✅ Dispatcher user created');

    // Create field officers
    const fieldOfficer1 = await User.create({
      name: 'Field Officer 1',
      email: 'field1@psc119.id',
      phone: '081234567892',
      password_hash: 'field123',
      role: 'field_officer'
    });

    const fieldOfficer2 = await User.create({
      name: 'Field Officer 2',
      email: 'field2@psc119.id',
      phone: '081234567893',
      password_hash: 'field123',
      role: 'field_officer'
    });
    console.log('✅ Field officers created');

    // Create managerial user
    const manager = await User.create({
      name: 'Manager PSC 119',
      email: 'manager@psc119.id',
      phone: '081234567894',
      password_hash: 'manager123',
      role: 'managerial'
    });
    console.log('✅ Managerial user created');

    // Create categories
    const categories = await MasterCategory.bulkCreate([
      { name: 'Kecelakaan Lalu Lintas', description: 'Kecelakaan kendaraan bermotor' },
      { name: 'Serangan Jantung', description: 'Kondisi darurat jantung' },
      { name: 'Stroke', description: 'Kondisi darurat stroke' },
      { name: 'Kecelakaan Kerja', description: 'Kecelakaan di tempat kerja' },
      { name: 'Keracunan', description: 'Kasus keracunan makanan/bahan kimia' },
      { name: 'Lain-lain', description: 'Kondisi darurat lainnya' }
    ]);
    console.log('✅ Categories created');

    // Create units
    const unit1 = await MasterUnit.create({
      name: 'Unit Jakarta Pusat',
      location: 'Jl. Medan Merdeka, Jakarta Pusat',
      coordinates: {
        type: 'Point',
        coordinates: [106.8270, -6.1751] // [longitude, latitude]
      },
      contact_phone: '021-1234567'
    });

    const unit2 = await MasterUnit.create({
      name: 'Unit Jakarta Selatan',
      location: 'Jl. Sudirman, Jakarta Selatan',
      coordinates: {
        type: 'Point',
        coordinates: [106.8229, -6.2088]
      },
      contact_phone: '021-2345678'
    });
    console.log('✅ Units created');

    // Create vehicles
    const vehicles = await MasterVehicle.bulkCreate([
      {
        plate_number: 'B-1234-ABC',
        type: 'ambulance',
        status: 'available',
        unit_id: unit1.id
      },
      {
        plate_number: 'B-5678-DEF',
        type: 'ambulance',
        status: 'available',
        unit_id: unit1.id
      },
      {
        plate_number: 'B-9012-GHI',
        type: 'ambulance',
        status: 'available',
        unit_id: unit2.id
      },
      {
        plate_number: 'B-3456-JKL',
        type: 'rescue',
        status: 'available',
        unit_id: unit2.id
      }
    ]);
    console.log('✅ Vehicles created');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Default credentials:');
    console.log('Admin: admin@psc119.id / admin123');
    console.log('Dispatcher: dispatcher@psc119.id / dispatcher123');
    console.log('Field Officer 1: field1@psc119.id / field123');
    console.log('Field Officer 2: field2@psc119.id / field123');
    console.log('Manager: manager@psc119.id / manager123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await sequelize.close();
  }
};

seedDatabase();
