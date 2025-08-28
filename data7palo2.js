var data7palo2 = `sno1,sno2, date, day of week,benchofficer1,benchofficer2,faishala, orders,benchstatus,remark1,remark2,remark3
01,1,20820407,wednesday,,,0,0,no causelist,सालतामेलीको कारण कुनै पेशी नराखिएको,,,
02,2,20820414,wednesday,,,0,0,no causelist,सालतामेलीको कारण कुनै पेशी नराखिएको,,,
03,3,20820421,wednesday,,,0,0,bench not held,गोलाप्रथाको विवादले पेशीसूचि नै प्रकाशित भएन,,,
04,4,20820428,wednesday,,,0,0,bench not held,गोलाप्रथाको विवादले पेशीसूचि नै प्रकाशित भएन,,,
05,5,20820504,wednesday,,,0,0,bench not held,गोलाप्रथाको विवादले पेशीसूचि नै प्रकाशित भएन,,,
06,6,20820511,wednesday,shiva,rajendra,1,0,bench held,गुठी सम्बन्धी मुद्दा नि.सु रहेको,सपना श्रीमान अकस्मात विरामी भएकोले निसु रहन गएको,निसुको मिति नतोकिएको
07,7,20820518,wednesday,basanta,shiva,,,,,,

`;

// Dataset metadata
var data7palo2Info = {
    name: "पालो(082/83)",
    description: "Bench management system 2082/83",
    emoji: "🧑‍🤝‍🧑",
    columns: 6,
    primaryKey: "benchstatus",
       rowColors: {
        "bench not held": "red",
        // Add more coloring rules as needed, key should match primaryKey value (lowercase)
    }
 

};
