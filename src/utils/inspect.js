import { v4 as uuidv4 } from 'uuid';
const statusOptions = ['Good', 'Needs Attention', 'Safety Concern', 'N/A']

const inspectionItems = [
    'Warning Lights',
    'Exterior Lights',
    'Under Hood',
    'Steering & Suspension',
    'Tires',
    'Brakes',
    'Axles',
    'Front Differential',
    'Transfer Case',
    'Rear Differential',    
]

const warningLights = {
    id: uuidv4(),
    label: 'Warning Lights',
    status: statusOptions[0],
    note: ''
}

const item = {
    id: '',
    label: '',
    status: statusOptions[0],
    note: ''
}

