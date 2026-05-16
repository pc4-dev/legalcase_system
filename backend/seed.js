const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Lawyer = require('./models/Lawyer');
const Case = require('./models/Case');
const Notification = require('./models/Notification');

const seed = async () => {
  await connectDB();

  // Clear existing data
  await Promise.all([User.deleteMany(), Lawyer.deleteMany(), Case.deleteMany(), Notification.deleteMany()]);
  console.log('🗑️  Cleared existing data');

  // Users
  const admin = await User.create({ name: 'Rahul Gupta', email: 'rahul@neoteric.in', password: 'admin123', role: 'admin', initials: 'RG' });
  console.log('👤  Admin user created — email: rahul@neoteric.in / password: admin123');

  // Lawyers
  const [sharma, dixit, bhadauria, kulshrestha, tiwari] = await Lawyer.insertMany([
    { name: 'Adv. R.K. Sharma', specialisation: 'Civil & Commercial', court: 'District Court, Gwalior', phone: '+91 98765 43210', email: 'rksha@legalassoc.in', chamber: 'Chamber 14, District Bar', colorVariant: 'blue', feesYTD: 180000, initials: 'RS' },
    { name: 'Adv. P. Dixit', specialisation: 'Writ & High Court matters', court: 'Gwalior Bench, HC', phone: '+91 94501 21000', email: 'pdixit@hclegal.in', chamber: 'HC Bar Chambers, Gwalior', colorVariant: 'green', feesYTD: 240000, initials: 'PD' },
    { name: 'Adv. N. Bhadauria', specialisation: 'Consumer & RERA matters', court: 'DCDRC, RERA MP', phone: '+91 93009 87654', email: 'nbhadauria@consumerlaw.in', colorVariant: 'purple', feesYTD: 90000, initials: 'NB' },
    { name: 'Adv. A. Kulshrestha', specialisation: 'Labour & Employment', court: 'Labour Court, Gwalior', phone: '+91 97541 88800', email: 'ak.labour@gmail.com', colorVariant: 'gold', feesYTD: 60000, initials: 'AK' },
    { name: 'Adv. V. Tiwari', specialisation: 'Title & Property matters', court: 'District Court, Gwalior', phone: '+91 99770 34500', colorVariant: 'red', feesYTD: 45000, initials: 'VT' },
  ]);
  console.log('⚖️   5 lawyers created');

  // Cases
  const cases = await Case.insertMany([
    {
      caseCode: 'CAS-2024-0031',
      title: 'Indian Oil Corporation Ltd. v. Neoteric Properties Pvt. Ltd.',
      subtitle: 'Lease / CAM charge dispute',
      entity: 'Neoteric Properties Pvt. Ltd.',
      court: 'District Court, Gwalior',
      bench: 'ADJ-III',
      lawyer: sharma._id,
      opposingCounsel: 'Adv. S. Mehta, IOCL Legal Cell',
      status: 'urgent',
      stage: 'hearing',
      nextHearingDate: new Date('2026-05-19'),
      hearingType: 'Final arguments — order may be passed',
      filedDate: new Date('2024-01-15'),
      reliefByPlaintiff: 'Recovery of ₹14.2L + interest @ 18% p.a.',
      ourPosition: 'Dismiss; counterclaim for wrongful vacancy charges',
      strategyRemarks: 'IOCL is claiming unpaid CAM charges of ₹14.2L. Our counterpoint: maintenance obligations were never formally handed over to Neoteric per the lease terms. Counter-affidavit must be filed before 18 May. Reference Clause 12(b) of the lease agreement. Adv. Sharma to brief senior counsel.',
      adjournments: [
        { date: new Date('2026-04-03'), reason: 'Adjourned — IOCL counsel unavailable', dotType: 'warn', notes: 'Adv. Mehta sought time; court granted 6 weeks' },
        { date: new Date('2026-02-14'), reason: 'Adjourned — court strike (bar association)', dotType: 'done' },
        { date: new Date('2026-01-08'), reason: 'Part heard — arguments begun, Neoteric side argued', dotType: 'info', notes: "IOCL's rebuttal scheduled next date" },
        { date: new Date('2024-08-22'), reason: 'First hearing — framing of issues', dotType: 'done' },
      ],
      documents: [
        { name: 'Plaint — IOCL_v_Neoteric.pdf', fileType: 'plaint', filePath: '/uploads/placeholder.pdf', fileSize: '1.2 MB', status: 'uploaded' },
        { name: 'Annexure A — Lease Agreement, IOCL.pdf', fileType: 'annexure', filePath: '/uploads/placeholder.pdf', fileSize: '2.4 MB', status: 'uploaded' },
        { name: 'Legal notice — IOCL to Neoteric, 12 Jan 2024.pdf', fileType: 'letter', filePath: '/uploads/placeholder.pdf', fileSize: '0.5 MB', status: 'uploaded' },
        { name: 'Counter-affidavit [DRAFT — pending upload]', fileType: 'affidavit', status: 'pending' },
      ],
      createdBy: admin._id,
    },
    {
      caseCode: 'CAS-2023-0018',
      title: 'Heaven Heights Pvt. Ltd. v. Contractor — Hyde Park Boundary Wall',
      entity: 'Heaven Heights Pvt. Ltd.',
      court: 'High Court, Gwalior Bench',
      bench: 'DB-II',
      lawyer: dixit._id,
      opposingCounsel: 'Adv. K.L. Verma',
      status: 'active',
      stage: 'arguments',
      nextHearingDate: new Date('2026-06-02'),
      hearingType: 'Rejoinder filing',
      filedDate: new Date('2023-10-15'),
      strategyRemarks: 'Contractor abandoned mid-work; ₹8.7L advance at risk. BOQ mismatch has been documented. Ensure site photographs and foreman affidavit are filed before next date.',
      adjournments: [
        { date: new Date('2026-03-28'), reason: 'Adjourned — bench reconstitution', dotType: 'warn' },
        { date: new Date('2023-12-12'), reason: 'Writ admitted — contractor served notice', dotType: 'info' },
      ],
      documents: [
        { name: 'Work Order — Hyde Park Boundary Wall.pdf', fileType: 'contract', status: 'uploaded' },
        { name: 'Annexure B — Site photographs (zip)', fileType: 'evidence', status: 'uploaded' },
        { name: 'Foreman affidavit [PENDING]', fileType: 'affidavit', status: 'pending' },
      ],
      createdBy: admin._id,
    },
    {
      caseCode: 'CAS-2025-0004',
      title: 'Navayan Realty v. Plot Buyer — Wildflower Township Possession Delay',
      entity: 'Navayan Realty',
      court: 'District Consumer Disputes Redressal Commission',
      lawyer: bhadauria._id,
      status: 'pending',
      stage: 'filing',
      filedDate: new Date('2025-01-10'),
      strategyRemarks: 'Buyer alleges 14-month possession delay. Defence: Force majeure clause + RERA extension certificate is applicable.',
      documents: [
        { name: 'Builder-Buyer Agreement — Annexure I [PENDING]', fileType: 'contract', status: 'pending' },
        { name: 'RERA Extension Certificate [PENDING]', fileType: 'other', status: 'pending' },
      ],
      createdBy: admin._id,
    },
    {
      caseCode: 'CAS-2024-0022',
      title: 'Neoteric Group v. Ex-Employee — Breach of NDA',
      entity: 'Neoteric Group',
      court: 'Labour Court, Gwalior',
      lawyer: kulshrestha._id,
      status: 'active',
      stage: 'hearing',
      nextHearingDate: new Date('2026-06-28'),
      hearingType: 'Evidence stage',
      filedDate: new Date('2024-06-01'),
      strategyRemarks: 'Ex-employee shared confidential project data with competitor. NDA violation clearly documented.',
      createdBy: admin._id,
    },
    {
      caseCode: 'CAS-2022-0009',
      title: 'Regal Garden Residents v. Heaven Heights Pvt. Ltd. — HT Billing Dispute',
      entity: 'Heaven Heights Pvt. Ltd.',
      court: 'District Consumer Disputes Redressal Commission',
      lawyer: sharma._id,
      status: 'closed',
      stage: 'settled',
      filedDate: new Date('2022-10-01'),
      closedDate: new Date('2026-03-11'),
      settlementDate: new Date('2026-03-11'),
      strategyRemarks: 'Revised HT electricity billing structure communicated to residents. Case withdrawn by complainants after corrected bills were issued.',
      documents: [
        { name: 'Consent terms — signed.pdf', fileType: 'decree', status: 'uploaded' },
      ],
      createdBy: admin._id,
    },
  ]);
  console.log(`📂  ${cases.length} cases created`);

  // Notifications
  await Notification.insertMany([
    {
      title: 'Hearing in 4 days — CAS-2024-0031',
      body: 'IOCL v. Neoteric. Counter-affidavit must be filed by 18 May. Adv. R.K. Sharma to be briefed. Clause 12(b) of lease to be highlighted.',
      type: 'urgent',
      icon: 'ti-alarm',
      relatedCase: cases[0]._id,
      dueDate: new Date('2026-05-19'),
      createdBy: admin._id,
    },
    {
      title: 'Document pending upload',
      body: 'Builder-Buyer Agreement for CAS-2025-0004 (Navayan v. Plot Buyer) is pending.',
      type: 'warn',
      icon: 'ti-file-alert',
      relatedCase: cases[2]._id,
      dueDate: new Date('2026-05-25'),
      createdBy: admin._id,
    },
    {
      title: 'Lawyer fee invoice due',
      body: 'Adv. P. Dixit ₹45,000 for HC matter (CAS-2023-0018). Process before month-end.',
      type: 'warn',
      icon: 'ti-receipt-2',
      dueDate: new Date('2026-05-31'),
      createdBy: admin._id,
    },
    {
      title: 'Foreman affidavit missing',
      body: 'CAS-2023-0018 (Hyde Park). Site supervisor to provide sworn affidavit before 28 May.',
      type: 'warn',
      icon: 'ti-file-alert',
      relatedCase: cases[1]._id,
      dueDate: new Date('2026-05-28'),
      createdBy: admin._id,
    },
    {
      title: 'Case settled & closed',
      body: 'CAS-2022-0009 (Regal Garden HT billing). Consent terms filed and signed. Archive complete.',
      type: 'success',
      icon: 'ti-circle-check',
      relatedCase: cases[4]._id,
      isRead: true,
      isResolved: true,
      createdBy: admin._id,
    },
  ]);
  console.log('🔔  5 notifications created');

  console.log('\n✅  Seed complete! You can now login with:');
  console.log('   Email:    rahul@neoteric.in');
  console.log('   Password: admin123\n');
  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });
