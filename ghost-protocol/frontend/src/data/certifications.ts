export interface CertificationEntry {
  id: string
  title: string
  issuer: string
  issuerShort: string
  credentialUrl: string
  category: string
  color: string
  image?: string
}

export const certificationsData: CertificationEntry[] = [
  {
    id: 'CERT-001',
    title: 'Supervised Machine Learning: Regression & Classification',
    issuer: 'Stanford University',
    issuerShort: 'STANFORD',
    credentialUrl: 'https://www.coursera.org/account/accomplishments/verify/9GVNN50P7N8L?utm_source=link&utm_medium=certificate&utm_content=cert_image&utm_campaign=sharing_cta&utm_product=course',
    category: 'ML_CORE',
    color: '#00e67a',
    image: '/images/certifications/Supervised Learning Regression and Classification.jpg',
  },
  {
    id: 'CERT-002',
    title: 'Advanced Machine Learning Algorithms',
    issuer: 'Stanford University',
    issuerShort: 'STANFORD',
    credentialUrl: 'https://www.coursera.org/account/accomplishments/verify/0NFV3Z8CPQTH?utm_source=link&utm_medium=certificate&utm_content=cert_image&utm_campaign=sharing_cta&utm_product=course',
    category: 'ML_CORE',
    color: '#00e67a',
    image: '/images/certifications/Advanced Machine Learning Algorithms.jpg',
  },
  {
    id: 'CERT-003',
    title: 'Machine Learning with Python',
    issuer: 'IBM',
    issuerShort: 'IBM',
    credentialUrl: 'https://www.coursera.org/account/accomplishments/verify/VEAATSSJ9GTZ',
    category: 'ML_CORE',
    color: '#00e67a',
    image: '/images/certifications/Machine Learning with Python.jpg',
  },
  {
    id: 'CERT-004',
    title: 'AWS Foundations: Machine Learning Basics',
    issuer: 'Amazon Web Services',
    issuerShort: 'AWS',
    credentialUrl: 'https://www.simplilearn.com/skillup-certificate-landing?token=eyJjb3Vyc2VfaWQiOiI0MzMzIiwiY2VydGlmaWNhdGVfdXJsIjoiaHR0cHM6XC9cL2NlcnRpZmljYXRlcy5zaW1wbGljZG4ubmV0XC9zaGFyZVwvdGh1bWJfNjgwMTM1Nl8xNzE5MDg2OTUwLnBuZyIsInVzZXJuYW1lIjoiUHJhbm5hdmFraGFudGgifQ%3D%3D&utm_source=shared-certificate&utm_medium=lms&utm_campaign=shared-certificate-promotion&referrer=https%3A%2F%2Flms.simplilearn.com%2Fcourses%2F7290%2FAWS-Foundations%3A-Machine-Learning-Basics%2Fcertificate%2Fdownload-skillup&%24web_only=true&_branch_match_id=1602284423035135522&_branch_referrer=H4sIAAAAAAAAA8soKSkottLXL87MLcjJ1EssKNDLyczL1k%2FV9ykpqSz2z6n09E6yrytKTUstKsrMS49PKsovL04tsvUBqkpN8cwDAO3SQBVBAAAA',
    category: 'CLOUD',
    color: '#00e67a',
    image: '/images/certifications/AWS Foundations Machine Learning Basics.jpg',
  },
  {
    id: 'CERT-005',
    title: 'Introduction to Generative AI',
    issuer: 'Google',
    issuerShort: 'GOOGLE',
    credentialUrl: 'https://www.coursera.org/account/accomplishments/verify/CHHZSU49ZX62',
    category: 'GEN_AI',
    color: '#00e67a',
    image: '/images/certifications/Introduction to Generative AI.jpg',
  },
  {
    id: 'CERT-006',
    title: 'Exploring Data Transformation with Google Cloud',
    issuer: 'Google Cloud',
    issuerShort: 'GCP',
    credentialUrl: 'https://www.simplilearn.com/skillup-certificate-landing?token=eyJjb3Vyc2VfaWQiOiI0MTk0IiwiY2VydGlmaWNhdGVfdXJsIjoiaHR0cHM6XC9cL2NlcnRpZmljYXRlcy5zaW1wbGljZG4ubmV0XC9zaGFyZVwvdGh1bWJfNjgzOTg3MF8xNzE5ODMyNTg1LnBuZyIsInVzZXJuYW1lIjoiUHJhbm5hdmFraGFudGgifQ%3D%3D&utm_source=shared-certificate&utm_medium=lms&utm_campaign=shared-certificate-promotion&referrer=https%3A%2F%2Flms.simplilearn.com%2Fcourses%2F7128%2FExploring-Data-Transformation-with-Google-Cloud%2Fcertificate%2Fdownload-skillup&%24web_only=true&_branch_match_id=1602284423035135522&_branch_referrer=H4sIAAAAAAAAA8soKSkottLXL87MLcjJ1EssKNDLyczL1k%2FV98%2FM8PI3r8wJ9k6yrytKTUstKsrMS49PKsovL04tsvUBqkpN8cwDAF%2F9b%2BZBAAAA',
    category: 'CLOUD',
    color: '#00e67a',
    image: '/images/certifications/Exploring Data Transformation with Google Cloud.jpg',
  },
  {
    id: 'CERT-007',
    title: 'Introduction to Artificial Intelligence',
    issuer: 'National Association of State Boards of Accountancy (NASBA)',
    issuerShort: 'NASBA',
    credentialUrl: 'https://www.linkedin.com/learning/certificates/4c532a86715f06b712b98a306d551c332a12f20df747845e2a1cdfae511bef75',
    category: 'AI',
    color: '#00e67a',
    image: '/images/certifications/Introduction to Artifical Intelligence.jpg',
  },
  {
    id: 'CERT-008',
    title: 'Artificial Intelligence Foundations: Neural Networks',
    issuer: 'National Association of State Boards of Accountancy (NASBA)',
    issuerShort: 'NASBA',
    credentialUrl: 'https://www.linkedin.com/learning/certificates/ad99e55eba3899e932957d973c343406a933f757c77990a565e9db57b929ef54',
    category: 'AI',
    color: '#00e67a',
    image: '/images/certifications/Artificial Intelligence Foundations Neural Networks.jpg',
  },
]
