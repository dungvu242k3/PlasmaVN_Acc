const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function checkData() {
    const supabaseData = fs.readFileSync('c:/Users/dungv/PlasmaVN_Acc/src/supabase/config.js', 'utf8');
    const urlMatch = supabaseData.match(/supabaseUrl\s*=\s*['"](.*)['"]/);
    const keyMatch = supabaseData.match(/supabaseAnonKey\s*=\s*['"](.*)['"]/);
    
    if (!urlMatch || !keyMatch) {
        console.error('Could not find Supabase credentials');
        return;
    }
    
    const supabase = createClient(urlMatch[1], keyMatch[1]);
    
    const { data, error } = await supabase
        .from('orders')
        .select('order_type')
        .limit(20);
        
    if (error) {
        console.error(error);
        return;
    }
    
    const types = data.map(o => o.order_type);
    console.log('Order types in DB:', [...new Set(types)]);
}

checkData();
