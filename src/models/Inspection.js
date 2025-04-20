import { v4 as uuidv4 } from 'uuid';

class Inspection {
    constructor(vehicleId, technicianId, id = uuidv4(), workOrder) {
        this.id = id;
        this.vehicleId = vehicleId;
        this.technicianId = technicianId;
        this.date = new Date();
        this.statusOptions = ['Good', 'Needs Attention', 'Safety Concern', 'N/A'];
        this.inspectionItems = [
            'Warning Lights',
            'Exterior Lights',
            'Air Filter',
            'Battery',
            'Belts',
            'Anti-Freeze',
            'Steering & Suspension',
            'Tires',
            'Brakes',
            'Axles',
            'Engine',
            'Transmission',
            'Front Differential',
            'Transfer Case',
            'Rear Differential',  
            'Other'  
            
        ];
        this.items = [];
        this.workOrder = workOrder;
        
        // Initialize with default items if none provided
        if (this.items.length === 0) {
            this.createInspection();
        }
        
        console.log('Inspection created:', this.id);
    }

    createInspection() {
        // Create inspection items with default "Good" status
        this.items = this.inspectionItems.map((label) => {
            return new InspectionItem(uuidv4(), label, this.statusOptions[0], '');
        });
        
        console.log(`Created ${this.items.length} inspection items`);
        return this.items;
    }
    
    getItem(id) {
        const item = this.items.find(item => item.id === id);
        if (!item) {
            console.log(`Item with ID ${id} not found`);
            return null;
        }
        return item;
    }
    
    getItemByLabel(label) {
        const item = this.items.find(item => item.label === label);
        if (!item) {
            console.log(`Item with label "${label}" not found`);
            return null;
        }
        return item;
    }
    
    updateItemStatus(id, status) {
        const item = this.getItem(id);
        if (item && this.statusOptions.includes(status)) {
            item.setStatus(status);
            console.log(`Updated status for ${item.label} to ${status}`);
            return item;
        } else if (!this.statusOptions.includes(status)) {
            console.log(`Invalid status: ${status}. Valid options are: ${this.statusOptions.join(', ')}`);
        }
        return null;
    }
    
    updateItemNotes(id, notes) {
        const item = this.getItem(id);
        if (item) {
            item.setNotes(notes);
            console.log(`Updated notes for ${item.label}`);
            return item;
        }
        return null;
    }
    
    addCustomItem(label, status = this.statusOptions[0], notes = '') {
        if (!label) {
            console.log('Cannot add item without a label');
            return null;
        }
        
        const newItem = new InspectionItem(uuidv4(), label, status, notes);
        this.items.push(newItem);
        console.log(`Added custom item: ${label}`);
        return newItem;
    }
    
    removeItem(id) {
        const initialLength = this.items.length;
        this.items = this.items.filter(item => item.id !== id);
        
        if (this.items.length < initialLength) {
            console.log(`Removed item with ID ${id}`);
            return true;
        }
        
        console.log(`Item with ID ${id} not found`);
        return false;
    }
    
    getSummary() {
        const summary = {
            id: this.id,
            vehicleId: this.vehicleId,
            technicianId: this.technicianId,
            date: this.date,
            itemCount: this.items.length,
            statusCounts: {
                'Good': 0,
                'Needs Attention': 0,
                'Safety Concern': 0,
                'N/A': 0
            }
        };
        
        // Count items by status
        this.items.forEach(item => {
            if (summary.statusCounts.hasOwnProperty(item.status)) {
                summary.statusCounts[item.status]++;
            }
        });
        
        console.log('Inspection summary generated');
        return summary;
    }
    
    toJSON() {
        return {
            id: this.id,
            vehicleId: this.vehicleId,
            technicianId: this.technicianId,
            date: this.date,
            items: this.items.map(item => item.toJSON()),
            workOrder: this.workOrder
        };
    }
    
    static fromJSON(json) {
        const inspection = new Inspection(
            json.vehicleId,
            json.technicianId,
            json.id,
            json.workOrder
        );
        
        // Override the default date
        inspection.date = new Date(json.date);
        
        // Clear default items and load from JSON
        inspection.items = [];
        if (json.items && Array.isArray(json.items)) {
            inspection.items = json.items.map(itemData => 
                InspectionItem.fromJSON(itemData)
            );
        }
        
        console.log(`Loaded inspection ${inspection.id} from JSON with ${inspection.items.length} items`);
        return inspection;
    }
}

class InspectionItem {
    constructor(id = uuidv4(), label, status, notes) {
        this.id = id;
        this.label = label;
        this.status = status;
        this.notes = notes;
    }
    
    setStatus(status) {
        this.status = status;
        console.log(`Status for "${this.label}" set to: ${status}`);
        return this;
    }
    
    setNotes(notes) {
        this.notes = notes;
        console.log(`Notes updated for "${this.label}"`);
        return this;
    }
    
    toJSON() {
        return {
            id: this.id,
            label: this.label,
            status: this.status,
            notes: this.notes
        };
    }
    
    static fromJSON(json) {
        return new InspectionItem(
            json.id,
            json.label,
            json.status,
            json.notes
        );
    }
}

export { Inspection, InspectionItem };