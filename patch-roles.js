const fs = require('fs');
const glob = require('fs').promises; // we don't have glob, let's use a simple approach

const files = [
  'src/app/api/customers/route.ts',
  'src/app/api/customers/[id]/interactions/route.ts',
  'src/app/api/web-licenses/route.ts',
  'src/app/api/web-licenses/[id]/route.ts',
  'src/app/api/users/route.ts',
  'src/app/api/users/[id]/route.ts',
  'src/app/api/admin/tickets/route.ts'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace the exact strings we saw
  content = content.replace(
    /session\.role !== 'SUPER_ADMIN' && session\.role !== 'SUPPORT'/g,
    "session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'SUPPORT'"
  );
  
  content = content.replace(
    /session\.role !== 'ADMIN'/g,
    "session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN'"
  );

  // Clean up if admin tickets route became redundant
  content = content.replace(
    /session\.role !== 'SUPER_ADMIN' && session\.role !== 'SUPER_ADMIN' && session\.role !== 'ADMIN' && session\.role !== 'SUPPORT' && session\.role !== 'SUPER_ADMIN' && session\.role !== 'ADMIN'/g,
    "session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'SUPPORT'"
  );

  fs.writeFileSync(file, content);
  console.log('Patched', file);
}
