require('dotenv').config();
const { sequelize, User, MasterCategory, MasterUnit, MasterVehicle, Report, Assignment, ReportLog } = require('../models');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Check if users already exist
    const existingUsers = await User.count();
    if (existingUsers > 0) {
      console.log('⚠️  Users already exist. Seeding sample reports and assignments only...');
      
      // Get existing users and categories
      const admin = await User.findOne({ where: { email: 'admin@psc119.id' } });
      const dispatcher = await User.findOne({ where: { email: 'dispatcher@psc119.id' } });
      const fieldOfficer1 = await User.findOne({ where: { email: 'field1@psc119.id' } });
      const fieldOfficer2 = await User.findOne({ where: { email: 'field2@psc119.id' } });
      const manager = await User.findOne({ where: { email: 'manager@psc119.id' } });
      
      const categories = await MasterCategory.findAll();
      const units = await MasterUnit.findAll();
      const vehicles = await MasterVehicle.findAll();
      
      if (!dispatcher || !fieldOfficer1 || categories.length === 0) {
        console.log('❌ Required base data missing. Please reset database and run seed again.');
        return;
      }

      await seedSampleReports(dispatcher, fieldOfficer1, fieldOfficer2, categories, units, vehicles);
      return;
    }

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

    await seedSampleReports(dispatcher, fieldOfficer1, fieldOfficer2, categories, [unit1, unit2], vehicles);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Sample Data Summary:');
    console.log('- 8 Reports (3 closed, 2 in-progress, 1 verified, 2 pending)');
    console.log('- 5 Assignments (3 completed, 2 in-progress)');
    console.log('- 7 Report Logs (audit trail)');
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

async function seedSampleReports(dispatcher, fieldOfficer1, fieldOfficer2, categories, units, vehicles) {
    const now = new Date();
    const hoursAgo = (hours) => new Date(now - hours * 60 * 60 * 1000);
    const daysAgo = (days) => new Date(now - days * 24 * 60 * 60 * 1000);

    // Closed reports (for SLA metrics)
    const closedReport1 = await Report.create({
      reporter_name: 'Budi Santoso',
      phone: '081234567899',
      description: 'Kecelakaan motor di Thamrin, korban terluka parah',
      latitude: -6.1751,
      longitude: 106.8270,
      address: 'Jl. MH Thamrin, Jakarta Pusat',
      status: 'closed',
      source: 'web',
      priority: 'high',
      category_id: categories[0].id, // Kecelakaan Lalu Lintas
      created_at: daysAgo(2),
      verified_at: daysAgo(2) + 15 * 60 * 1000, // 15 minutes after creation
      closed_at: daysAgo(2) + 18 * 60 * 60 * 1000 // 18 hours after creation (within SLA)
    });

    const closedReport2 = await Report.create({
      reporter_name: 'Siti Nurhaliza',
      phone: '081234567898',
      description: 'Pasien serangan jantung di rumah, kondisi kritis',
      latitude: -6.2088,
      longitude: 106.8229,
      address: 'Jl. Sudirman, Jakarta Selatan',
      status: 'closed',
      source: 'phone',
      priority: 'critical',
      category_id: categories[1].id, // Serangan Jantung
      created_at: daysAgo(1),
      verified_at: daysAgo(1) + 5 * 60 * 1000, // 5 minutes
      closed_at: daysAgo(1) + 10 * 60 * 60 * 1000 // 10 hours (within SLA)
    });

    const closedReport3 = await Report.create({
      reporter_name: 'Ahmad Wijaya',
      phone: '081234567897',
      description: 'Kecelakaan kerja, terjatuh dari ketinggian',
      latitude: -6.1850,
      longitude: 106.8350,
      address: 'Kawasan Industri, Jakarta Timur',
      status: 'closed',
      source: 'web',
      priority: 'medium',
      category_id: categories[3].id, // Kecelakaan Kerja
      created_at: daysAgo(3),
      verified_at: daysAgo(3) + 30 * 60 * 1000, // 30 minutes
      closed_at: daysAgo(3) + 28 * 60 * 60 * 1000 // 28 hours (exceeded SLA)
    });

    console.log('✅ Closed reports created');

    // In progress reports
    const inProgressReport1 = await Report.create({
      reporter_name: 'Dewi Lestari',
      phone: '081234567896',
      description: 'Pasien stroke, kesulitan berbicara dan bergerak',
      latitude: -6.1950,
      longitude: 106.8200,
      address: 'Jl. Gatot Subroto, Jakarta Pusat',
      status: 'in_progress',
      source: 'web',
      priority: 'high',
      category_id: categories[2].id, // Stroke
      created_at: hoursAgo(4),
      verified_at: hoursAgo(3) + 45 * 1000 // 45 seconds
    });

    const inProgressReport2 = await Report.create({
      reporter_name: 'Rudi Hartono',
      phone: '081234567895',
      description: 'Keracunan makanan massal di pesta pernikahan',
      latitude: -6.2100,
      longitude: 106.8400,
      address: 'Gedung Serbaguna, Menteng',
      status: 'in_progress',
      source: 'phone',
      priority: 'high',
      category_id: categories[4].id, // Keracunan
      created_at: hoursAgo(2),
      verified_at: hoursAgo(2) + 2 * 60 * 1000 // 2 minutes
    });

    console.log('✅ In-progress reports created');

    // Verified reports (waiting for assignment)
    const verifiedReport1 = await Report.create({
      reporter_name: 'Eko Prasetyo',
      phone: '081234567894',
      description: 'Kecelakaan truk di tol, beberapa korban',
      latitude: -6.1650,
      longitude: 106.8500,
      address: 'Tol Dalam Kota KM 12',
      status: 'verified',
      source: 'web',
      priority: 'critical',
      category_id: categories[0].id, // Kecelakaan Lalu Lintas
      created_at: hoursAgo(1),
      verified_at: hoursAgo(1) + 3 * 60 * 1000 // 3 minutes
    });

    console.log('✅ Verified reports created');

    // Pending reports
    const pendingReport1 = await Report.create({
      reporter_name: 'Lisa Marlina',
      phone: '081234567893',
      description: 'Ibu hamil akan melahirkan di mobil',
      latitude: -6.2200,
      longitude: 106.8100,
      address: 'Jl. Asia Afrika, Tanah Abang',
      status: 'pending',
      source: 'web',
      priority: 'high',
      category_id: categories[5].id, // Lain-lain
      created_at: hoursAgo(0.5)
    });

    const pendingReport2 = await Report.create({
      reporter_name: 'Joko Susanto',
      phone: '081234567892',
      description: 'Luka bakar di dapur restoran',
      latitude: -6.1800,
      longitude: 106.8300,
      address: 'Restoran Sederhana, Menteng',
      status: 'pending',
      source: 'phone',
      priority: 'medium',
      category_id: categories[5].id,
      created_at: hoursAgo(0.2)
    });

    console.log('✅ Pending reports created');

    // Create assignments for closed reports
    const assignment1 = await Assignment.create({
      report_id: closedReport1.id,
      assigned_to: fieldOfficer1.id,
      assigned_by: dispatcher.id,
      vehicle_id: vehicles[0].id,
      unit_id: units[0].id,
      status: 'completed',
      notes: 'Tim sudah di lokasi, korban dibawa ke RSUD',
      assigned_at: daysAgo(2) + 20 * 60 * 1000,
      accepted_at: daysAgo(2) + 22 * 60 * 1000,
      completed_at: closedReport1.closed_at
    });

    const assignment2 = await Assignment.create({
      report_id: closedReport2.id,
      assigned_to: fieldOfficer2.id,
      assigned_by: dispatcher.id,
      vehicle_id: vehicles[1].id,
      unit_id: units[0].id,
      status: 'completed',
      notes: 'Pasien distabilkan dan dibawa ke RS Jantung',
      assigned_at: daysAgo(1) + 8 * 60 * 1000,
      accepted_at: daysAgo(1) + 10 * 60 * 1000,
      completed_at: closedReport2.closed_at
    });

    const assignment3 = await Assignment.create({
      report_id: closedReport3.id,
      assigned_to: fieldOfficer1.id,
      assigned_by: dispatcher.id,
      vehicle_id: vehicles[2].id,
      unit_id: units[1].id,
      status: 'completed',
      notes: 'Korban diamankan dan dirawat di RS',
      assigned_at: daysAgo(3) + 35 * 60 * 1000,
      accepted_at: daysAgo(3) + 40 * 60 * 1000,
      completed_at: closedReport3.closed_at
    });

    console.log('✅ Completed assignments created');

    // Create assignments for in-progress reports
    const assignment4 = await Assignment.create({
      report_id: inProgressReport1.id,
      assigned_to: fieldOfficer2.id,
      assigned_by: dispatcher.id,
      vehicle_id: vehicles[0].id,
      unit_id: units[0].id,
      status: 'in_progress',
      notes: 'Tim dalam perjalanan ke lokasi',
      assigned_at: hoursAgo(3) + 5 * 60 * 1000,
      accepted_at: hoursAgo(3) + 7 * 60 * 1000
    });

    const assignment5 = await Assignment.create({
      report_id: inProgressReport2.id,
      assigned_to: fieldOfficer1.id,
      assigned_by: dispatcher.id,
      vehicle_id: vehicles[1].id,
      unit_id: units[0].id,
      status: 'in_progress',
      notes: 'Evakuasi korban keracunan sedang berlangsung',
      assigned_at: hoursAgo(1) + 45 * 1000,
      accepted_at: hoursAgo(1) + 50 * 1000
    });

    console.log('✅ In-progress assignments created');

    // Create report logs for audit trail
    await ReportLog.create({
      report_id: closedReport1.id,
      actor_id: dispatcher.id,
      action: 'verified',
      notes: 'Laporan diverifikasi, korban konfirmasi masih di lokasi'
    });

    await ReportLog.create({
      report_id: closedReport1.id,
      actor_id: dispatcher.id,
      action: 'assigned',
      notes: 'Ditugaskan ke Field Officer 1 dengan ambulans B-1234-ABC'
    });

    await ReportLog.create({
      report_id: closedReport1.id,
      actor_id: fieldOfficer1.id,
      action: 'accepted',
      notes: 'Tugas diterima, menuju lokasi'
    });

    await ReportLog.create({
      report_id: closedReport1.id,
      actor_id: fieldOfficer1.id,
      action: 'completed',
      notes: 'Korban berhasil dievakuasi dan dibawa ke RSUD, kondisi stabil',
      photo_url: '/uploads/proofs/sample-proof-1.jpg'
    });

    await ReportLog.create({
      report_id: inProgressReport1.id,
      actor_id: dispatcher.id,
      action: 'verified',
      notes: 'Pasien stroke dikonfirmasi keluarga'
    });

    await ReportLog.create({
      report_id: inProgressReport1.id,
      actor_id: dispatcher.id,
      action: 'assigned',
      notes: 'Ditugaskan ke Field Officer 2'
    });

    await ReportLog.create({
      report_id: inProgressReport1.id,
      actor_id: fieldOfficer2.id,
      action: 'accepted',
      notes: 'Tim dalam perjalanan, ETA 15 menit'
    });

    console.log('✅ Report logs created');
}

seedDatabase();

