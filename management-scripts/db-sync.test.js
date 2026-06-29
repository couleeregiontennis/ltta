const fs = require('fs');
const path = require('path');
const { describe, it, expect } = require('@jest/globals');

describe('Database Schema Validation', () => {
    it('should ensure sync_user_metadata trigger function is properly guarded against overwriting existing names', () => {
        const schemaPath = path.join(__dirname, '../supabase/schema.sql');
        const stagingSchemaPath = path.join(__dirname, '../supabase/staging/schema.sql');
        
        const filesToCheck = [schemaPath, stagingSchemaPath];
        
        expect(filesToCheck.length).toBeGreaterThan(0);

        for (const filePath of filesToCheck) {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Extract the function body or search for the buggy pattern
            // The buggy pattern was setting first_name/last_name directly to split_part(NEW.email, '@', 1)
            // without any CASE or COALESCE/NULLIF checking if they are already populated.
            const buggyPattern = /(?:first_name|last_name)\s*=\s*split_part\(\s*NEW\.email/i;
            const hasBuggyPattern = buggyPattern.test(content);
            
            expect(hasBuggyPattern).toBe(false);
            
            // Verify that we check if first_name/last_name is null or empty before setting
            const hasGuardedFirstName = /first_name\s*=\s*(CASE|COALESCE)/i.test(content);
            const hasGuardedLastName = /last_name\s*=\s*(CASE|COALESCE)/i.test(content);
            
            expect(hasGuardedFirstName).toBe(true);
            expect(hasGuardedLastName).toBe(true);
        }
    });
});
