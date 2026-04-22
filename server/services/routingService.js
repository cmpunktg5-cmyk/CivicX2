/**
 * Routing Service - Maps complaint categories to specific departments
 * and assigns them based on location and priority.
 */

const DEPARTMENTS = {
  garbage: { name: 'Waste Management', head: 'Officer Ramesh', contact: 'waste-dept@civicx.gov' },
  sewage: { name: 'Sewage & Sanitation', head: 'Officer Sneha', contact: 'sanitation@civicx.gov' },
  pothole: { name: 'Public Works (Roads)', head: 'Officer Kumar', contact: 'roads@civicx.gov' },
  streetlight: { name: 'Electrical Board', head: 'Officer Priya', contact: 'electrical@civicx.gov' },
  electrical: { name: 'Electrical Board', head: 'Officer Priya', contact: 'electrical@civicx.gov' },
  water: { name: 'Water Supply Board', head: 'Officer Anita', contact: 'water@civicx.gov' },
  noise: { name: 'Public Safety (Police)', head: 'Inspector Rao', contact: 'safety@civicx.gov' },
  encroachment: { name: 'Town Planning', head: 'Officer Verma', contact: 'planning@civicx.gov' },
  traffic: { name: 'Traffic Police', head: 'Inspector Gill', contact: 'traffic@civicx.gov' },
  other: { name: 'General Administration', head: 'Officer Khan', contact: 'admin@civicx.gov' }
};

const assignAuthority = (category, priority) => {
  const dept = DEPARTMENTS[category] || DEPARTMENTS.other;
  
  // Logic to determine sub-office or specific officer could go here based on coordinates
  // For now, we return the department mapping
  
  return {
    department: dept.name,
    assignedTo: dept.head,
    contactEmail: dept.contact,
    routingPriority: priority === 'critical' ? 1 : priority === 'high' ? 2 : 3
  };
};

module.exports = { assignAuthority, DEPARTMENTS };
