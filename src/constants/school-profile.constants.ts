export const SCHOOL_PROFILE_PAGE = {
  title: 'School Profile',
  subtitle: 'Manage your school information, contact details, and principal info.',
  sections: {
    basic: 'Basic Information',
    contact: 'Contact Details',
    location: 'Location',
    principal: 'Principal Details',
    academic: 'Academic Configuration',
  },
  fields: {
    name: 'School Name',
    code: 'School Code',
    udise_code: 'UDISE Code',
    affiliation_number: 'Affiliation Number',
    established_year: 'Established Year',
    timezone: 'Timezone',
    board_type: 'Board Type',
    marking_system: 'Marking System',
    email: 'Email',
    contact_number: 'Contact Number',
    website: 'Website',
    address: 'Address',
    city: 'City',
    state: 'State',
    country: 'Country',
    pincode: 'Pincode',
    lat: 'Latitude',
    lng: 'Longitude',
    principal_name: 'Principal Name',
    principal_email: 'Principal Email',
    principal_phone: 'Principal Phone',
    logo_url: 'Logo URL',
  },
  save: 'Save Profile',
  saving: 'Saving...',
  saved: 'School profile updated successfully',
} as const;

export const BOARD_TYPE_OPTIONS = [
  { value: 'CBSE', label: 'CBSE' },
  { value: 'ICSE', label: 'ICSE' },
  { value: 'STATE', label: 'State Board' },
  { value: 'IB', label: 'IB' },
  { value: 'IGCSE', label: 'IGCSE' },
] as const;

export const MARKING_SYSTEM_OPTIONS = [
  { value: 'MARKS', label: 'Marks' },
  { value: 'GRADES', label: 'Grades' },
  { value: 'CGPA', label: 'CGPA' },
] as const;

export const TIMEZONE_OPTIONS = [
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)' },
  { value: 'Asia/Karachi', label: 'Pakistan Standard Time (PKT)' },
  { value: 'Asia/Dhaka', label: 'Bangladesh Standard Time (BST)' },
  { value: 'Asia/Singapore', label: 'Singapore Time (SGT)' },
  { value: 'UTC', label: 'UTC' },
] as const;
