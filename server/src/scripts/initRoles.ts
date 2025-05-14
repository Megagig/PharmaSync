import mongoose from 'mongoose';
import config from '../config';
import Role from '../models/role.model';
import { RoleType, DEFAULT_ROLE_PERMISSIONS } from '../interfaces/role.interface';

/**
 * Initialize default roles in the database
 */
const initRoles = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database.url);
    console.log('Connected to MongoDB');

    // Check if roles already exist
    const existingRoles = await Role.find();
    
    if (existingRoles.length > 0) {
      console.log(`${existingRoles.length} roles already exist in the database.`);
    }

    // Create default roles if they don't exist
    for (const roleType of Object.values(RoleType)) {
      const existingRole = await Role.findOne({ type: roleType });
      
      if (!existingRole) {
        // Get default permissions for this role
        const permissions = DEFAULT_ROLE_PERMISSIONS[roleType] || [];
        
        // Create role name from type (convert snake_case to Title Case)
        const name = roleType
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        // Create role
        const role = new Role({
          name,
          type: roleType,
          description: `Default ${name} role`,
          permissions,
          isActive: true,
          isDefault: true,
        });
        
        await role.save();
        console.log(`Created default role: ${name}`);
      } else {
        console.log(`Role ${existingRole.name} already exists.`);
      }
    }

    console.log('Role initialization completed successfully.');
  } catch (error) {
    console.error('Error initializing roles:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script if this file is executed directly
if (require.main === module) {
  initRoles()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error running role initialization script:', error);
      process.exit(1);
    });
}

export default initRoles;
