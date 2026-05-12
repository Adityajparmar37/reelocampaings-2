// Sample CSV data for download
export const SAMPLE_CONTACTS_CSV = `name,email,phone,tags
John Doe,john@example.com,1234567890,vip|newsletter
Jane Smith,jane@example.com,1987654321,active
Charlie Brown,charlie@example.com,,newsletter
Alice Johnson,alice@example.com,1122334455,vip|event
Bob Wilson,bob@example.com,,active|beta
Aditya Parmar,aditya@example.com,1234567890,`

// Test failure CSV data for download
export const TEST_FAILURE_CONTACTS_CSV = `name,email,phone,tags
Test Fail 1,fail1@example.com,1234567890,test
Test Fail 2,fail2@example.com,1234567891,test
Test Fail 3,fail3@example.com,1234567892,test
Test Fail 4,fail4@example.com,1234567893,test
Test Fail 5,fail5@example.com,1234567894,test
Test Fail 6,fail6@example.com,1234567895,test`

// Contact table columns
export const CONTACT_TABLE_COLUMNS = ['Name', 'Email', 'Phone', 'Tags', 'Created']

// Contact sort options
export const CONTACT_SORT_OPTIONS = [
  { value: 'createdAt', label: 'Sort: Date' },
  { value: 'name', label: 'Sort: Name' },
  { value: 'email', label: 'Sort: Email' },
]

// Contact sort direction options
export const CONTACT_SORT_DIRECTIONS = [
  { value: 'desc', label: 'Desc' },
  { value: 'asc', label: 'Asc' },
]

// Pagination settings
export const CONTACTS_PER_PAGE = 50

// CSV file requirements
export const CSV_FILE_COLUMNS = 'name, email, phone, tags (pipe-separated)'

// Success message timeout (ms)
export const SUCCESS_MESSAGE_TIMEOUT = 4000

// Search debounce timeout (ms)
export const SEARCH_DEBOUNCE_TIMEOUT = 350

// Maximum tags to display before showing "+N more"
export const MAX_VISIBLE_TAGS = 4
