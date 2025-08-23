// Script to create initial admin user for AOI
// Run this once to set up the first admin account

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Service role key needed for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  try {
    console.log('🚀 Creating initial admin user...')
    
    // Create user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@artofimplosion.com',
      password: 'AOI2025!Admin',
      email_confirm: true
    })

    if (authError) {
      console.error('❌ Auth error:', authError.message)
      return
    }

    console.log('✅ Auth user created:', authData.user.id)

    // Create staff profile
    const { data: profileData, error: profileError } = await supabase
      .from('staff_profiles')
      .insert([{
        id: authData.user.id,
        username: 'admin',
        full_name: 'AOI Administrator',
        role: 'admin',
        active: true
      }])
      .select()
      .single()

    if (profileError) {
      console.error('❌ Profile error:', profileError.message)
      return
    }

    console.log('✅ Staff profile created:', profileData)
    console.log('\n🎉 Admin user created successfully!')
    console.log('📧 Email: admin@artofimplosion.com')
    console.log('👤 Username: admin')
    console.log('🔑 Password: AOI2025!Admin')
    console.log('\n⚠️  Please change the password after first login!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

createAdminUser()
