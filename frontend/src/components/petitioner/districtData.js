// src/components/petitioner/districtData.js

// Export the data as a single object for easy import
export const districtData = {
    // Petition Types
    petitionTypes: [
        'Complaint',
        'Request',
        'Suggestion',
        'Inquiry',
        'Grievance',
        'Application',
        'Appeal',
        'Other'
    ],

    // Department options
    departments: [
        'Transport Department',
        'Municipality Department',
        'Healthcare Department',
        'Education Department',
        'Public Works Department',
        'Police Department',
        'Revenue Department',
        'Social Welfare Department',
        'Agriculture Department',
        'Electricity Board',
        'Water Resources Department',
        'Rural Development Department',
        'Urban Development Department',
        'Forest Department',
        'Other'
    ],

    // Gender options
    genderOptions: [
        'Male',
        'Female',
        'Other'
    ],

    // Community options
    communities: [
        'General',
        'BC',
        'MBC',
        'SC',
        'ST',
        'Other'
    ],

    // Special Category options
    specialCategories: [
        'None',
        'Senior Citizen',
        'Person with Disability',
        'BPL',
        'Widow',
        'Ex-Servicemen',
        'Transgender',
        'Other'
    ],

    // Tamil Nadu districts in alphabetical order
    districts: [
        'Ariyalur',
        'Chengalpattu',
        'Chennai',
        'Coimbatore',
        'Cuddalore',
        'Dharmapuri',
        'Dindigul',
        'Erode',
        'Kallakurichi',
        'Kanchipuram',
        'Kanniyakumari',
        'Karur',
        'Krishnagiri',
        'Madurai',
        'Mayiladuthurai',
        'Nagapattinam',
        'Namakkal',
        'Nilgiris',
        'Perambalur',
        'Pudukkottai',
        'Ramanathapuram',
        'Ranipet',
        'Salem',
        'Sivaganga',
        'Tenkasi',
        'Thanjavur',
        'Theni',
        'Thoothukudi',
        'Tiruchirappalli',
        'Tirunelveli',
        'Tirupathur',
        'Tiruppur',
        'Tiruvallur',
        'Tiruvannamalai',
        'Tiruvarur',
        'Vellore',
        'Viluppuram',
        'Virudhunagar'
    ],

    // Taluks mapped by district
    taluksByDistrict: {
        "Ariyalur": ["Ariyalur", "Sendurai", "Udayarpalayam"],
        "Chengalpattu": ["Chengalpattu", "Cheyyur", "Maduranthakam", "Pallavaram", "Tambaram", "Thiruporur", "Tirukalukundram", "Vandalur"],
        "Chennai": ["Alandur", "Ambattur", "Aminjikarai", "Ayanavaram", "Egmore", "Guindy", "Madhavaram", "Maduravoyal", "Mambalam", "Mylapore", "Perambur", "Purasawalkam", "Sholinganallur", "Thiruvottiyur", "Tondiarpet", "Velachery"],
        "Coimbatore": ["Anaimalai", "Annur", "Coimbatore North", "Coimbatore South", "Kinathukadavu", "Madukkarai", "Mettupalayam", "Perur", "Pollachi", "Sulur", "Valparai"],
        "Cuddalore": ["Cuddalore", "Bhuvanagiri", "Chidambaram", "Kattumannarkoil", "Kurinjipadi", "Panruti", "Srimushnam", "Thittakudi", "Vriddhachalam"],
        "Dharmapuri": ["Dharmapuri", "Harur", "Karimangalam", "Nallampalli", "Palacode", "Pappireddipatti"],
        "Dindigul": ["Attur", "Dindigul East", "Dindigul West", "Kodaikanal", "Natham", "Nilakottai", "Oddanchatram", "Palani", "Vedasandur"],
        "Erode": ["Anthiyur", "Bhavani", "Erode", "Gobichettipalayam", "Kodumudi", "Modakkurichi", "Nambiyur", "Perundurai", "Sathyamangalam", "Thalavadi"],
        "Kallakurichi": ["Kallakurichi", "Chinnaselam", "Kalvarayan Hills", "Sankarapuram", "Ulundurpet"],
        "Kanchipuram": ["Kanchipuram", "Kundrathur", "Sriperumbudur", "Uthiramerur", "Walajabad"],
        "Kanniyakumari": ["Agastheeswaram", "Kalkulam", "Killiyoor", "Thiruvattar", "Thovalai", "Vilavancode"],
        "Karur": ["Aravakurichi", "Kadavur", "Karur", "Krishnarayapuram", "Kulithalai", "Manmangalam", "Pugalur"],
        "Krishnagiri": ["Anchetti", "Bargur", "Denkanikottai", "Hosur", "Krishnagiri", "Pochampalli", "Shoolagiri", "Uthangarai"],
        "Madurai": ["Kallikudi", "Madurai East", "Madurai North", "Madurai South", "Madurai West", "Melur", "Peraiyur", "Thirumangalam", "Thiruparankundram", "Usilampatti", "Vadipatti"],
        "Mayiladuthurai": ["Mayiladuthurai", "Kuthalam", "Sirkali", "Tharangambadi"],
        "Nagapattinam": ["Kilvelur", "Nagapattinam", "Thirukkuvalai", "Vedaranyam"],
        "Namakkal": ["Kolli Hills", "Kumarapalayam", "Mohanur", "Namakkal", "Paramathi Velur", "Rasipuram", "Sendamangalam", "Tiruchengode"],
        "Nilgiris": ["Coonoor", "Gudalur", "Kotagiri", "Kundah", "Ooty", "Panthalur"],
        "Perambalur": ["Alathur", "Perambalur", "Veppanthattai"],
        "Pudukkottai": ["Alangudi", "Aranthangi", "Avudaiyarkoil", "Gandarvakottai", "Illuppur", "Karambakudi", "Kulathur", "Manamelkudi", "Ponnamaravathi", "Pudukkottai", "Thirumayam", "Viralimalai"],
        "Ramanathapuram": ["Kadaladi", "Kamuthi", "Kilakarai", "Mudukulathur", "Paramakudi", "Rajasingamangalam", "Ramanathapuram", "Rameswaram", "Tiruvadanai"],
        "Ranipet": ["Arakkonam", "Arcot", "Kalavai", "Nemili", "Sholingur", "Walajah"],
        "Salem": ["Attur", "Edapadi", "Gangavalli", "Mettur", "Omalur", "Pethanayakanpalayam", "Salem", "Salem West", "Sangagiri", "Valapady", "Yercaud"],
        "Sivaganga": ["Devakottai", "Ilayangudi", "Karaikkudi", "Manamadurai", "Singampunari", "Sivaganga", "Thiruppuvanam", "Tirupathur"],
        "Tenkasi": ["Alangulam", "Kadayanallur", "Sankarankovil", "Shenkottai", "Sivagiri", "Tenkasi", "V.K.Pudur"],
        "Thanjavur": ["Budalur", "Kumbakonam", "Orathanadu", "Papanasam", "Pattukkottai", "Peravurani", "Thanjavur", "Thiruvaiyaru", "Thiruvidaimarudur"],
        "Theni": ["Andipatti", "Bodinayakanur", "Periyakulam", "Theni", "Uthamapalayam"],
        "Thoothukudi": ["Eral", "Ettayapuram", "Kayathar", "Kovilpatti", "Ottapidaram", "Sattankulam", "Thoothukudi", "Tiruchendur", "Vilathikulam"],
        "Tiruchirappalli": ["Lalgudi", "Manachanallur", "Manapparai", "Marungapuri", "Musiri", "Srirangam", "Thottiyam", "Thuraiyur", "Tiruchirappalli West", "Tiruchirappalli East", "Tiruverumbur"],
        "Tirunelveli": ["Ambasamudram", "Cheranmahadevi", "Manur", "Nanguneri", "Palayamkottai", "Radhapuram", "Thisayanvilai", "Tirunelveli"],
        "Tirupathur": ["Ambur", "Natrampalli", "Tirupathur", "Vaniyambadi"],
        "Tiruppur": ["Avinashi", "Dharapuram", "Kangayam", "Madathukulam", "Palladam", "Tiruppur North", "Tiruppur South", "Udumalaipettai"],
        "Tiruvallur": ["Avadi", "Gummidipoondi", "Pallipattu", "Ponneri", "Poonamallee", "R.K. Pettai", "Tiruttani", "Tiruvallur", "Uthukkottai"],
        "Tiruvannamalai": ["Arani", "Chengam", "Cheyyar", "Jamunamarathur", "Kalasapakkam", "Kilpennathur", "Polur", "Thandrampet", "Tiruvannamalai", "Vandavasi", "Vembakkam"],
        "Tiruvarur": ["Kodavasal", "Koothanallur", "Mannargudi", "Nannilam", "Needamangalam", "Thiruthuraipoondi", "Tiruvarur", "Valangaiman"],
        "Vellore": ["Anaicut", "Gudiyatham", "Katpadi", "K.V. Kuppam", "Pernambut", "Vellore"],
        "Viluppuram": ["Gingee", "Kandachipuram", "Marakkanam", "Melmalaiyanur", "Thiruvennainallur", "Vanur", "Vikravandi", "Viluppuram"],
        "Virudhunagar": ["Aruppukkottai", "Kariapatti", "Rajapalayam", "Sattur", "Sivakasi", "Srivilliputtur", "Tiruchuli", "Vembakottai", "Virudhunagar", "Watrap"]
    }
};