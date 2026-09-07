import fs from 'fs';

let content = fs.readFileSync('src/lib/data/doctorRepository.js', 'utf8');

const target = `    const { data, count, error } = await supabase
      .from('doctors')
      .select(\`
        id, slug, full_name, experience_years,
        city, state, medical_registration_number, publication_status, verification_status, created_at,
        offers_home_visits, professional_phone, whatsapp_number,
        home_visit_contact_public, home_visit_service_areas, home_visit_days,
        home_visit_start_time, home_visit_end_time, home_visit_fee, home_visit_note,
        doctor_affiliations_directory(
          id, department, position, is_current,
          hospital_name, hospitals(id, slug, name, city, locality)
        )
      \`, { count: 'exact' })
      .eq('publication_status', 'published')
      .range(offset, offset + pageSize - 1);`;

const replace = `    let query = supabase
      .from('doctors')
      .select(\`
        id, slug, full_name, experience_years, specialization, locality,
        city, state, medical_registration_number, publication_status, verification_status, created_at,
        offers_home_visits, professional_phone, whatsapp_number,
        home_visit_contact_public, home_visit_service_areas, home_visit_days,
        home_visit_start_time, home_visit_end_time, home_visit_fee, home_visit_note,
        doctor_affiliations_directory(
          id, department, position, is_current,
          hospital_name, hospitals(id, slug, name, city, locality)
        )
      \`, { count: 'exact' })
      .eq('publication_status', 'published');

    if (filters.q) {
      query = query.or(\`full_name.ilike.%\${filters.q}%,specialization.ilike.%\${filters.q}%,locality.ilike.%\${filters.q}%,city.ilike.%\${filters.q}%\`);
    }
    if (filters.location) {
      query = query.or(\`locality.ilike.%\${filters.location}%,city.ilike.%\${filters.location}%\`);
    }
    if (filters.specialization) {
      query = query.ilike('specialization', \`%\${filters.specialization}%\`);
    }
    if (filters.homeVisitsOnly) {
      query = query.eq('offers_home_visits', true);
    }
    if (filters.serviceArea) {
      query = query.contains('home_visit_service_areas', [filters.serviceArea]);
    }
    
    // hospital filter is tricky because it's a joined table. We'll fetch all and filter in JS if hospital filter is present.
    // For simplicity, we can do it in JS since there's 50 doctors total right now. But proper way is using referenced table filters.
    // supabase allows: doctor_affiliations_directory!inner(hospital_name) but our select is complex.

    if (sort === 'name_desc') {
      query = query.order('full_name', { ascending: false });
    } else if (sort === 'experience_desc') {
      query = query.order('experience_years', { ascending: false, nullsFirst: false });
    } else {
      query = query.order('full_name', { ascending: true });
    }

    if (!filters.hospital && !filters.language) {
      query = query.range(offset, offset + pageSize - 1);
    }

    const { data, count, error } = await query;
    let finalData = data;
    let finalCount = count;

    if (!error && (filters.hospital || filters.language)) {
      // In-memory filter for relations since PostgREST nested filtering is limited
      const hospQ = (filters.hospital || '').toLowerCase();
      finalData = data.filter(doc => {
        const hospMatch = !hospQ || doc.doctor_affiliations_directory?.some(a => 
          (a.hospital_name || '').toLowerCase().includes(hospQ) || 
          (a.hospitals?.name || '').toLowerCase().includes(hospQ)
        );
        return hospMatch;
      });
      finalCount = finalData.length;
      finalData = finalData.slice(offset, offset + pageSize);
    }`;

content = content.replace(target, replace);

// Let's also ensure `data` in searchDoctors checks `finalData`
content = content.replace(/if \(error\) \{/g, `if (error) {\n      console.error('Supabase doctor query error details:', error);\n    `);
content = content.replace(/\} else if \(Array\.isArray\(data\) && data\.length > 0\) \{/g, `} else if (Array.isArray(finalData)) {`);
content = content.replace(/const canonical = data\.map\(normalizeCanonicalDoctor\);/g, `const canonical = finalData.map(normalizeCanonicalDoctor);`);
content = content.replace(/return \{ doctors: canonical, totalCount: count \?\? canonical\.length, hasMore: offset \+ canonical\.length < \(count \?\? canonical\.length\) \};/g, `return { doctors: canonical, totalCount: finalCount ?? canonical.length, hasMore: offset + canonical.length < (finalCount ?? canonical.length) };`);

fs.writeFileSync('src/lib/data/doctorRepository.js', content);
