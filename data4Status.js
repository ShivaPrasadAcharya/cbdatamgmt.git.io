var data4Status = `सिनं,निनं,नेकाप,अङ्क,मिति,मुद्दा,पक्ष,विपक्ष,इजलास,विवाद,फैसला,शब्दसूचि,कैफियत,आलोचना
1,11064,2080,4,2079-09-07,बन्दी,परिवर्तित नाम ०४-५-ठ को हकमा रिदमा विष्ट,जिल्ला सरकारी वकील कार्यालय-झापा,बृहत पूर्ण (५), अनुसन्धान वा थुनछेकको क्रममा अभिभावकको जिम्मामा रहेको (Parental Custody) अवधिलाई कैदमा गणना नगरी DC ले बाल सुधार गृह पठाएकोले रिट दायर भएको,बालबालिकालाई शर्त तोकि परिवारको जिम्मा लगाएको अवस्थामा सोको गणना सुधार गृहभित्र बस्ने अवधिमा गणना गर्नुपर्ने// बालबालिकाले गरेको कसूरको gravity अदालतले गरेको सजायको आधारमा गरिने नभई कसूरक प्रकृति र कानूनले तोकेको दायार (range) को आधारमा हुने// बालबालिकासम्बन्धी ऐन २०७५ को दफा १६(१)/२४(२)(ख)/३६ को व्याख्या,Juvenile Justice//Best Interest of Child//Restorative Justice,AMB को राय// HPP को partial dissenting opinion, पूर्ण इजलासले उठाएका सबै प्रश्नहरू विवादसँग सान्दर्भिक नरहेको भनी सोको सम्बोधन वृहत इजलासबाट नभएको (जस्तैः बालबालिकालाई हुने कैद सजाय र सुधार गृहमा राख्ने सजाय छुट्टाछुट्टै प्रकृतिको सजाय हो वा होइन?) 
2,11065,2080,4,2079-07-24,उत्प्रेषणसमेत,रामनारायण प्रसादसेमत,संसद सचिवालय,पूर्ण(३),स्वास्थ्य सेवा ऐन २०५३ को चौथो संसोधन संविधान विपरीत रहेको,फरक कामको फरक योग्यता तोकिएको कुरा समानताको हक विरूद्ध नहुने// SC को जुनसुकै इजलासले पनि संविधानको व्याख्या गर्न सक्ने,Interpretation of Constitution//IPK समेतको इजलास// Concurrent Jurisdiction of CB & Regular Bench,N/A
3,10714,2078,8,2077-09-08,कर्तव्य ज्यान,शिला पुन बुढामगर,नेपाल सरकार,division,कम सजाय गरी पाउँ,अभियोगदावी पुग्ने/ सदर/ सदर- सर्वस्वको सजाय नहुने,आत्मरक्षा (self defence) को प्रयोगको व्याख्या,33 Bar Exam,
4,10823,2079,2,2077-09-03,बन्दीप्रत्यक्षीकरण,शिवचन्द्र राय कुर्मीको हकमा अ.प्रमोदकुमार राय,धनुषा जिल्ला अदालतसमेत,division,कैदको सट्टा रकम बुझाइ थुनामुक्त हुन पाउँ,रिट खारेज,Criminal Code §155 को व्याख्या,IPK को राय,
5,10824,2079,2,2077-09-14,उत्प्रेषणसमेत,धीरेन्द्रकुमार झासमेत,नेपाल संस्कृत विश्वविद्यालय,division,विश्वविद्यालयमा पदाधिकारी नियुक्ति गरी पाउँ,परमादेश जारी,आवश्यकताको सिद्धान्त (Doctrine of Necessity) को प्रयोगको व्याख्या,IPK को राय,
6,10877,2079,5,2078-02-26,बन्दीप्रत्यक्षीकरण,सुमन भण्डारी,काठमाडौं जिल्ला अदालतसमेत,division,कोरोना भाइसको विषम परिस्थिति हुँदा थुना मुक्त हुन पाउँ,रिट खारेज/ ७३ नं को निवेदन लिई शीघ्र कारवाही र किनारा गर्न उच्च अदालत पाटनक नाउँमा आदेश जारी,साधारण क्षेत्राधिकार र असाधारण क्षेत्राधिकारको सीमा निर्धारण,33 Bar Exam,
7,10873,2079,5,2078-08-20,उत्प्रषणसमेत,सविनलाल श्रेष्ठ,भोगेन्द्र विक्रम नेम्वाङसमेत,division,,रिट खारेज,"Parallel writ Jurisdicition/Concurrent writ Jurisdiction between HC & SC is matter of choice/रिट आदेशमा चित्त नबुझे दोपा आउनुपर्ने, रिट आउन नमिल्ने",,अआ छलफलमा पूर्ण सुनुवाई
`;


// Dataset metadata
var data4StatusInfo = {
    name: "Najir",
    description: "Najir-Comments ",
    emoji: "📝",
    columns: 6,
    primaryKey: "SNo",
    rowColors: {
               "14": "red"
    }
};

// Generalized row coloring script for STATUS table: user can set primaryKey (any column) and rowColors for its values
document.addEventListener('DOMContentLoaded', function () {
    var info = window.data4StatusInfo || {};
    var primaryKey = (info.primaryKey || '').toLowerCase();
    var rowColors = info.rowColors || {};
    var customColorFn = typeof info.getRowColor === 'function' ? info.getRowColor : null;
    if (!primaryKey || !rowColors) return;

    // Find all tables with STATUS info (by caption or aria-label)
    var tables = Array.from(document.querySelectorAll('table'));
    tables.forEach(function (table) {
        var isStatusTable = false;
        // Check caption or aria-label for STATUS
        var caption = table.querySelector('caption');
        if (caption && /status/i.test(caption.textContent)) isStatusTable = true;
        if (table.getAttribute('aria-label') && /status/i.test(table.getAttribute('aria-label'))) isStatusTable = true;
        // Heuristic: check headers for the primaryKey
        var ths = Array.from(table.querySelectorAll('th'));
        if (ths.some(th => th.textContent.trim().toLowerCase() === primaryKey)) isStatusTable = true;
        if (!isStatusTable) return;

        // Find the index of the primaryKey column
        var headerCells = Array.from(table.querySelectorAll('thead th'));
        var keyIdx = headerCells.findIndex(th => th.textContent.trim().toLowerCase() === primaryKey);
        if (keyIdx === -1) return;

        // Color each row based on the primaryKey value only
        Array.from(table.querySelectorAll('tbody tr')).forEach(function (row) {
            var cells = row.children;
            if (cells.length <= keyIdx) return;
            var cellValueRaw = cells[keyIdx].textContent.trim();
            var cellValueLower = cellValueRaw.toLowerCase();
            var color = '';
            if (customColorFn) {
                color = customColorFn(cellValueRaw, row, table);
            } else {
                color = rowColors[cellValueRaw] || rowColors[cellValueLower] || '';
            }
            // Named colors
            if (color === 'red') row.style.backgroundColor = '#ffd6d6';
            else if (color === 'blue') row.style.backgroundColor = '#d6e6ff';
            else if (color === 'green') row.style.backgroundColor = '#d6ffd6';
            // Allow any valid CSS color
            else if (color && color !== 'default') row.style.backgroundColor = color;
            else row.style.backgroundColor = '';
        });
    });
});