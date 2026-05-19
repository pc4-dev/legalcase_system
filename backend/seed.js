const mongoose = require('mongoose');
require('dotenv').config();
const connectDB      = require('./config/db');
const User           = require('./models/User');
const Lawyer         = require('./models/Lawyer');
const Case           = require('./models/Case');
const Notification   = require('./models/Notification');
const Entity         = require('./models/Entity');

const seed = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany(), Lawyer.deleteMany(),
    Case.deleteMany(), Notification.deleteMany(), Entity.deleteMany(),
  ]);
  console.log('🗑️  Cleared existing data');

  /* ── Admin user ── */
  const admin = await User.create({
    name: 'Rahul Gupta', email: 'rahul@neoteric.in',
    password: 'admin123', role: 'admin', initials: 'RG',
  });
  console.log('👤  Admin user created — email: rahul@neoteric.in / password: admin123');

  /* ── Entities ── */
  const [entNeoteric, entNavayan, entHeaven, entGroup] = await Entity.insertMany([
    { name: 'Neoteric Properties Pvt. Ltd.', shortName: 'Neoteric Properties', type: 'Private Limited', registrationNo: 'U70100MP2010PTC024567', address: 'Gwalior, Madhya Pradesh', contactPerson: 'Rahul Gupta', colorVariant: 'orange', createdBy: admin._id },
    { name: 'Navayan Realty',                shortName: 'Navayan Realty',       type: 'Partnership',    address: 'Gwalior, Madhya Pradesh', contactPerson: 'Rahul Gupta', colorVariant: 'blue',   createdBy: admin._id },
    { name: 'Heaven Heights Pvt. Ltd.',      shortName: 'Heaven Heights',       type: 'Private Limited', registrationNo: 'U45200MP2015PTC034891', address: 'Gwalior, Madhya Pradesh', contactPerson: 'Rahul Gupta', colorVariant: 'green',  createdBy: admin._id },
    { name: 'Neoteric Group',                shortName: 'Neoteric Group',        type: 'Other',           address: 'Gwalior, Madhya Pradesh', contactPerson: 'Rahul Gupta', colorVariant: 'purple', createdBy: admin._id },
  ]);
  console.log('🏢  4 entities created');

  /* ── Lawyers ── */
  const [sharma, dixit, bhadauria, kulshrestha, tiwari] = await Lawyer.insertMany([
    { name: 'Adv. R.K. Sharma',    specialisation: 'Civil & Commercial',    court: 'District Court, Gwalior',  phone: '+91 98765 43210', email: 'rksha@legalassoc.in',        chamber: 'Chamber 14, District Bar',    colorVariant: 'blue',   feesYTD: 180000, initials: 'RS' },
    { name: 'Adv. P. Dixit',       specialisation: 'Writ & High Court',     court: 'Gwalior Bench, HC',         phone: '+91 94501 21000', email: 'pdixit@hclegal.in',           chamber: 'HC Bar Chambers, Gwalior',    colorVariant: 'green',  feesYTD: 240000, initials: 'PD' },
    { name: 'Adv. N. Bhadauria',   specialisation: 'Consumer & RERA',       court: 'DCDRC, RERA MP',            phone: '+91 93009 87654', email: 'nbhadauria@consumerlaw.in',                                           colorVariant: 'purple', feesYTD: 90000,  initials: 'NB' },
    { name: 'Adv. A. Kulshrestha', specialisation: 'Labour & Employment',   court: 'Labour Court, Gwalior',     phone: '+91 97541 88800', email: 'ak.labour@gmail.com',                                                  colorVariant: 'orange', feesYTD: 60000,  initials: 'AK' },
    { name: 'Adv. V. Tiwari',      specialisation: 'Title & Property',      court: 'District Court, Gwalior',  phone: '+91 99770 34500',                                                                                  colorVariant: 'red',    feesYTD: 45000,  initials: 'VT' },
  ]);
  console.log('⚖️   5 lawyers created');

  /* ── Cases ── */
  const cases = await Case.insertMany([
    { caseCode: 'CAS-2024-0031', title: 'Indian Oil Corporation Ltd. v. Neoteric Properties Pvt. Ltd.', subtitle: 'Lease / CAM charge dispute', entity: entNeoteric.name, court: 'District Court, Gwalior', bench: 'ADJ-III', lawyer: sharma._id, opposingCounsel: 'Adv. S. Mehta, IOCL Legal Cell', status: 'urgent', stage: 'hearing', nextHearingDate: new Date('2026-05-19'), hearingType: 'Final arguments', filedDate: new Date('2024-01-15'), reliefByPlaintiff: 'Recovery of ₹14.2L + interest @ 18% p.a.', ourPosition: 'Dismiss; counterclaim for wrongful vacancy charges', strategyRemarks: 'IOCL is claiming unpaid CAM charges of ₹14.2L. Counter-affidavit must be filed before 18 May.', adjournments: [{ date: new Date('2026-04-03'), reason: 'Adjourned — IOCL counsel unavailable', dotType: 'warn', notes: 'Adv. Mehta sought time; court granted 6 weeks' }, { date: new Date('2026-01-08'), reason: 'Part heard — arguments begun', dotType: 'info' }], documents: [{ name: 'Plaint — IOCL_v_Neoteric.pdf', fileType: 'plaint', filePath: '/uploads/placeholder.pdf', fileSize: '1.2 MB', status: 'uploaded' }, { name: 'Counter-affidavit [DRAFT — pending upload]', fileType: 'affidavit', status: 'pending' }], createdBy: admin._id },
    { caseCode: 'CAS-2023-0018', title: 'Heaven Heights Pvt. Ltd. v. Contractor — Hyde Park Boundary Wall', entity: entHeaven.name, court: 'High Court, Gwalior Bench', bench: 'DB-II', lawyer: dixit._id, opposingCounsel: 'Adv. K.L. Verma', status: 'active', stage: 'arguments', nextHearingDate: new Date('2026-06-02'), hearingType: 'Rejoinder filing', filedDate: new Date('2023-10-15'), strategyRemarks: 'Contractor abandoned mid-work; ₹8.7L advance at risk.', adjournments: [{ date: new Date('2026-03-28'), reason: 'Adjourned — bench reconstitution', dotType: 'warn' }], documents: [{ name: 'Work Order — Hyde Park Boundary Wall.pdf', fileType: 'contract', status: 'uploaded' }, { name: 'Foreman affidavit [PENDING]', fileType: 'affidavit', status: 'pending' }], createdBy: admin._id },
    { caseCode: 'CAS-2025-0004', title: 'Navayan Realty v. Plot Buyer — Wildflower Township Possession Delay', entity: entNavayan.name, court: 'District Consumer Disputes Redressal Commission', lawyer: bhadauria._id, status: 'pending', stage: 'filing', filedDate: new Date('2025-01-10'), strategyRemarks: 'Buyer alleges 14-month possession delay. Defence: Force majeure + RERA extension.', documents: [{ name: 'Builder-Buyer Agreement [PENDING]', fileType: 'contract', status: 'pending' }, { name: 'RERA Extension Certificate [PENDING]', fileType: 'other', status: 'pending' }], createdBy: admin._id },
    { caseCode: 'CAS-2024-0022', title: 'Neoteric Group v. Ex-Employee — Breach of NDA', entity: entGroup.name, court: 'Labour Court, Gwalior', lawyer: kulshrestha._id, status: 'active', stage: 'hearing', nextHearingDate: new Date('2026-06-28'), hearingType: 'Evidence stage', filedDate: new Date('2024-06-01'), createdBy: admin._id },
    { caseCode: 'CAS-2022-0009', title: 'Regal Garden Residents v. Heaven Heights Pvt. Ltd. — HT Billing Dispute', entity: entHeaven.name, court: 'District Consumer Disputes Redressal Commission', lawyer: sharma._id, status: 'closed', stage: 'settled', filedDate: new Date('2022-10-01'), closedDate: new Date('2026-03-11'), settlementDate: new Date('2026-03-11'), strategyRemarks: 'Revised HT billing communicated. Case withdrawn by complainants.', documents: [{ name: 'Consent terms — signed.pdf', fileType: 'decree', status: 'uploaded' }], createdBy: admin._id },
  ]);
  console.log(`📂  ${cases.length} cases created`);

  /* ── Notifications ── */
  await Notification.insertMany([
    { title: 'Hearing in 4 days — CAS-2024-0031', body: 'IOCL v. Neoteric. Counter-affidavit must be filed by 18 May. Adv. Sharma to be briefed.', type: 'urgent', icon: 'ti-alarm', relatedCase: cases[0]._id, dueDate: new Date('2026-05-19'), createdBy: admin._id },
    { title: 'Document pending upload', body: 'Builder-Buyer Agreement for CAS-2025-0004 is pending.', type: 'warn', icon: 'ti-file-alert', relatedCase: cases[2]._id, dueDate: new Date('2026-05-25'), createdBy: admin._id },
    { title: 'Lawyer fee invoice due', body: 'Adv. P. Dixit ₹45,000 for HC matter (CAS-2023-0018). Process before month-end.', type: 'warn', icon: 'ti-receipt-2', dueDate: new Date('2026-05-31'), createdBy: admin._id },
    { title: 'Case settled & closed', body: 'CAS-2022-0009 Regal Garden HT billing. Consent terms filed.', type: 'success', icon: 'ti-circle-check', relatedCase: cases[4]._id, isRead: true, isResolved: true, createdBy: admin._id },
  ]);
  console.log('🔔  4 notifications created');

  console.log('\n✅  Seed complete! Login with:');
  console.log('   Email:    rahul@neoteric.in');
  console.log('   Password: admin123\n');
  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });
