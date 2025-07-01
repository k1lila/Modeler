# Modeler Frontend
 Frontend side 


app\app.js eshte entry point 

app\custom-modeler mban 2 module ku bej extend base modeler. Punoj me panelet, me dizajnin, funksionalitetin etj. 

app\custom-modeler\index.js merr nje vlere nga js parameter query ( modeler = basic, cstnu, pstnu ) dhe ne baze te vleres i shtoj funksionalitete nje js prototype CustomModeler

app\command-interceptor\CSTNUcommandinterceptor.js ben inherit nga nje js prototype qe eshte build in ne formen e nje stack, i cili me lejon te kap te dhena ne delete. Dmth kur behet delete dicka, e kap si veprim nepermjet command interceptor. 

app\moodle ketu ruaj ne format json, te dhenat te cilat i perdor per te bere extend modelerin ( i perdor me vone tek custom-modeler )

Keto ishin 2 projekte qe 2 student nuk i mbaruan dhe mi dhane mua. Ideja eshte qe te dhenat i merr live dhe ne cdo krijim elementi, e con ne backend. Ne backend duhet te ishte nje algoritem specifik per analizimin e te dhenave live - prape nuk e mbaruan. Prandaj une tani e bej si simulim analizen e te dhenave. 

Pak a shume tek STNU ( backend service ne java ) e kam shkruajtur nje algoritem te ri - me ka ngelur te bej kalimin e te dhenave nga frontend ne backend.

Tek CSTNU ( backend service ne java ) i kaloj te dhenat momentalisht, i bej save ne nje format te caktuar qe quhet graphml, pastaj kete po provoja ta kaloja ne nje aplikacion qe e hap me CMD ( skam algoritem tjeter, dhe kete me dhane ne format java.exe ). Analiza pasi e fus ne kete aplikacion me kthen nje pergjigje ose po ose jo. Nqs eshte jo, me kthen edhe nje vlere ku ngec, te cilen duhet ta gjej ne grafik. Po beja teste qe te perdorja XPath per ta gjetur ( nuk i kam integruar akoma ). Problemi eshte se duhet ta hap kete aplikacion nga CMD ne cdo krijim elementi te ri - prandaj u perpoqa dhe e gjeta si kod online po shtoj linkun:
https://github.com/ElsevierSoftwareX/SOFTX-D-21-00153

Mund te shikosh CSTNU service. Tek tema ne pdf, tek mapping kam rregullat qe perdor per te bere kalimin nga BPMN ( qe krijohet ne modeler ) ne CSTNU ( qe perdorim ne backend ). 
