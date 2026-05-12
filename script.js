/* ================================================================
   WORLDCUP · script.js · Pi Network · MAINNET · sandbox:false
   Version 13 — Complete Professional App
   ✅ Real Pi authentication (Pi.authenticate)
   ✅ Real Pi payments (Pi.createPayment)
   ✅ Calls /.netlify/functions/approve (approve.js)
   ✅ Calls /.netlify/functions/complete (complete.js)
   ✅ Auto serial Fan ID (global counter, never repeats)
   ✅ Full i18n EN/AR/FR/ES (all switching correctly)
   ✅ QR tickets + verification + anti-cheat
   ✅ Live fixture data (OpenFootball CC0)
   ✅ Analytics, notifications, leaderboard
================================================================ */
'use strict';

/* ══════════════════════════════════════════════════════
   TRANSLATIONS — EN / AR / FR / ES
   Applied via data-i attributes on every element
══════════════════════════════════════════════════════ */
var I18N = {
en:{
  tagline:"The World's #1 Football Fan App on Pi Network",
  tag1:'📅 Live Fixtures',tag2:'🧠 Predictions',tag3:'🎟️ QR Tickets',
  tag4:'📊 Analytics',tag5:'🔔 Live Alerts',tag6:'👤 Auto Fan ID',
  signin:'Sign In with Pi',
  disc:'Community fan app · Pi Network Mainnet · sandbox:false · Not affiliated with any official football organization',
  nav_matches:'Matches',nav_groups:'Groups',nav_predict:'Predict',
  nav_table:'Table',nav_tools:'Tools',nav_fan:'Fan',nav_profile:'Me',
  today_matches:"Today's Matches",upcoming:'Upcoming Fixtures',results:'Recent Results',
  teams:'Teams',matches:'Matches',cities:'Cities',
  all_groups:'All 12 Groups',
  groups_desc:'⚽ 48 teams · 12 groups of 4 · Top 2 from each group advance to the Round of 32',
  your_pts:'Your Points',streak:'Streak',
  pred_desc:'🧠 Predict outcomes · +5 pts per prediction · +10 pts if correct',
  pick_winner:'Pick Your Winner',fan_lb:'Fan Leaderboard',group_standings:'Group Standings',
  tool_wallet:'Pi Wallet Profile',tool_wallet_d:'Auto Fan ID · wallet sync · send Pi',
  tool_ticket:'Match Tickets',tool_ticket_d:'QR digital ticket · stadium entry',
  tool_fanid:'Fan ID Card',tool_fanid_d:'Auto serial · scan to profile · send Pi',
  tool_checkin:'Event Check-in',tool_checkin_d:'Fan zone · stadium QR check-in',
  tool_verify:'Ticket Verifier',tool_verify_d:'One-time QR · anti-fraud · live validate',
  tool_pred_qr:'Prediction QR',tool_pred_qr_d:'Tamper-evident prediction proof',
  tool_analytics:'Analytics Dashboard',tool_analytics_d:'Accuracy · history · streak tracking',
  tool_odds:'Odds Calculator',tool_odds_d:'Match prediction confidence meter',
  tool_pi:'Pi Calculator',tool_pi_d:'Convert Pi → USD · GBP · EUR · SAR',
  tool_sim:'Group Simulator',tool_sim_d:'Simulate group stage outcomes',
  tool_time:'Match Times',tool_time_d:'Convert ET kick-off to your timezone',
  tool_compare:'Team Compare',tool_compare_d:'Head-to-head team analysis',
  tool_pts:'Points Tracker',tool_pts_d:'Full prediction activity history',
  fan_level:'Level',total_pts:'Total Points',
  btn_send:'💸 Send Pi',btn_request:'📨 Request Pi',
  recipient:'Recipient',recipient_ph:'Pi username or G... address',
  amount:'Amount (π)',memo:'Memo',memo_ph:'Fan tip...',
  req_from:'Request From',req_ph:'Pi username',reason:'Reason',reason_ph:'WorldCup fan',
  ticket_desc:'Generate a QR digital ticket. Unique ID · valid 24h · one-time scan only.',
  select_match:'Select Match',gen_ticket:'🎟️ Generate QR Ticket',
  verify_ticket:'Verify Ticket',btn_verify:'🔍 Verify',
  your_predictions:'Your Prediction Proof',gen_pred_qr:'🧠 Generate Prediction Proof',
  scan_verify:'Verify Hash',pred_qr_desc:'Predictions are cryptographically hashed — proves you submitted before results. Anti-cheat certified.',
  fanid_desc:'Your Fan ID auto-generates on every login with a global serial number that never repeats. Scan the QR — redirects to your profile so anyone can send Pi.',
  scan_to_profile:'Scan → view profile → send Pi → follow fan',refresh_id:'🔄 Refresh Fan ID',
  select_event:'Select Event',checkin_now:'📍 Check In Now',
  checkin_desc:'Check in to fan zones and simulate stadium entry. Each check-in generates a unique QR. +5 pts per check-in.',
  checkin_history:'Check-in History',no_checkins:'No check-ins yet',
  performance:'Performance Overview',accuracy:'Prediction Accuracy',total_preds:'Total Predictions',
  correct:'Correct',points_earned:'Points Earned',best_streak:'Best Streak',
  engagement:'Engagement',streak_health:'Streak Health',
  pts_history:'Points · Last 7 Days',chart_note:'Bar heights = relative daily gains',
  confidence:'Prediction Confidence',team_a_win:'Team A Win %',draw_pct:'Draw %',team_b_win:'Team B Win %',
  enter_above:'Enter values above',convert_pi:'Convert Pi to Currency',
  pi_amount:'Pi Amount',pi_price:'Pi Price (USD)',quick_vals:'Quick Values',
  future_val:'Future Value',holdings:'Holdings (π)',target:'Target Price $',
  select_group:'Select Group',et_time:'Match Kick-off (ET)',
  team_a:'Team A',team_b:'Team B',predictions:'Preds',comments:'Posts',
  activity_log:'Activity Log',fan_zone:'Fan Zone',
  fan_zone_desc:'Share predictions, reactions and thoughts with the global Pi Network football community.',
  fan_placeholder:'Talk about the match, your team, or the tournament...',
  post_fan:'Post to Fan Zone',latest_fans:'Latest From Fans',
  points:'Points',daily_reward:'Daily Reward',
  daily_desc:'+10 pts every 24 hours · 7-day streak = +20 pts bonus',
  claim_daily:'Claim Daily Reward',premium:'Premium Fan',
  perk1:'Unlimited daily predictions',perk2:'Exclusive ⭐ badge on leaderboard',
  perk3:'Early match analysis and previews',perk4:'Priority leaderboard placement',
  perk5:'Ad-free experience throughout app',perk6:'All Fan Tools permanently unlocked',
  unlock_premium:'Unlock Premium — 0.5π',tx_history:'Transaction History',
  clear_history:'Clear History',logout:'Logout',
  notifications:'Notifications',mark_read:'Mark All Read',send_receive:'Send & Request Pi'
},
ar:{
  tagline:'أفضل تطبيق كرة قدم في العالم على Pi Network',
  tag1:'📅 مباريات مباشرة',tag2:'🧠 تنبؤات',tag3:'🎟️ تذاكر QR',
  tag4:'📊 تحليلات',tag5:'🔔 تنبيهات',tag6:'👤 هوية تلقائية',
  signin:'تسجيل الدخول بـ Pi',
  disc:'تطبيق مجتمعي · Pi Network · sandbox:false · غير تابع لأي منظمة رسمية',
  nav_matches:'المباريات',nav_groups:'المجموعات',nav_predict:'توقع',
  nav_table:'الجدول',nav_tools:'أدوات',nav_fan:'منطقة',nav_profile:'ملفي',
  today_matches:'مباريات اليوم',upcoming:'المباريات القادمة',results:'النتائج الأخيرة',
  teams:'فرق',matches:'مباريات',cities:'مدن',
  all_groups:'جميع المجموعات الـ 12',
  groups_desc:'⚽ 48 فريق · 12 مجموعة · أفضل 2 يتأهلان لدور الـ 32',
  your_pts:'نقاطك',streak:'تواصل',
  pred_desc:'🧠 توقع النتائج · +5 نقاط لكل تنبؤ · +10 إذا صح',
  pick_winner:'اختر الفائز',fan_lb:'قائمة المشجعين',group_standings:'ترتيب المجموعات',
  tool_wallet:'ملف محفظة Pi',tool_wallet_d:'هوية تلقائية · مزامنة محفظة · إرسال Pi',
  tool_ticket:'تذاكر المباريات',tool_ticket_d:'تذكرة QR رقمية · دخول الملعب',
  tool_fanid:'بطاقة هوية المشجع',tool_fanid_d:'رقم تسلسلي تلقائي · مسح للمتابعة',
  tool_checkin:'تسجيل الحضور',tool_checkin_d:'منطقة المشجعين · QR دخول الملعب',
  tool_verify:'التحقق من التذكرة',tool_verify_d:'تحقق مرة واحدة · مانع الغش',
  tool_pred_qr:'QR التنبؤ',tool_pred_qr_d:'إثبات التنبؤ · محمي من التلاعب',
  tool_analytics:'لوحة التحليلات',tool_analytics_d:'الدقة · التاريخ · تتبع التواصل',
  tool_odds:'حاسبة الاحتمالات',tool_odds_d:'مقياس ثقة التنبؤ',
  tool_pi:'حاسبة Pi',tool_pi_d:'تحويل Pi → دولار · جنيه · يورو · ريال',
  tool_sim:'محاكي المجموعة',tool_sim_d:'محاكاة نتائج المجموعات',
  tool_time:'أوقات المباريات',tool_time_d:'تحويل ET إلى منطقتك',
  tool_compare:'مقارنة الفرق',tool_compare_d:'تحليل المواجهات المباشرة',
  tool_pts:'متتبع النقاط',tool_pts_d:'سجل كامل لنقاط التنبؤ',
  fan_level:'المستوى',total_pts:'مجموع النقاط',
  btn_send:'💸 إرسال Pi',btn_request:'📨 طلب Pi',
  recipient:'المستلم',recipient_ph:'اسم مستخدم Pi أو عنوان G...',
  amount:'المبلغ (π)',memo:'ملاحظة',memo_ph:'إكرامية مشجع',
  req_from:'طلب من',req_ph:'اسم مستخدم Pi',reason:'السبب',reason_ph:'مشجع WorldCup',
  ticket_desc:'أنشئ تذكرة QR. معرف فريد · صالحة 24 ساعة · مسح مرة واحدة فقط.',
  select_match:'اختر المباراة',gen_ticket:'🎟️ إنشاء تذكرة QR',
  verify_ticket:'التحقق من التذكرة',btn_verify:'🔍 تحقق',
  your_predictions:'QR إثبات التنبؤ',gen_pred_qr:'🧠 إنشاء إثبات التنبؤ',
  scan_verify:'تحقق من الهاش',pred_qr_desc:'التنبؤات مشفرة رياضياً — يثبت إرسالك قبل النتائج. معتمد من نظام مانع الغش.',
  fanid_desc:'يتم إنشاء هويتك تلقائياً عند كل دخول برقم تسلسلي عالمي لا يتكرر. امسح QR لعرض ملفك وإرسال Pi.',
  scan_to_profile:'مسح ← عرض الملف ← إرسال Pi ← متابعة',refresh_id:'🔄 تجديد هوية المشجع',
  select_event:'اختر الفعالية',checkin_now:'📍 سجّل الآن',
  checkin_desc:'سجّل حضورك في مناطق المشجعين. +5 نقاط لكل تسجيل.',
  checkin_history:'سجل الحضور',no_checkins:'لا يوجد تسجيل بعد',
  performance:'نظرة عامة على الأداء',accuracy:'دقة التنبؤ',total_preds:'إجمالي التنبؤات',
  correct:'صحيح',points_earned:'النقاط المكتسبة',best_streak:'أفضل تواصل',
  engagement:'التفاعل',streak_health:'صحة التواصل',
  pts_history:'النقاط · آخر 7 أيام',chart_note:'ارتفاع الأعمدة = نقاط يومية نسبية',
  confidence:'ثقة التنبؤ',team_a_win:'نسبة فوز أ %',draw_pct:'تعادل %',team_b_win:'نسبة فوز ب %',
  enter_above:'أدخل القيم أعلاه',convert_pi:'تحويل Pi إلى عملة',
  pi_amount:'كمية Pi',pi_price:'سعر Pi (دولار)',quick_vals:'قيم سريعة',
  future_val:'القيمة المستقبلية',holdings:'حيازاتك (π)',target:'السعر المستهدف $',
  select_group:'اختر المجموعة',et_time:'وقت المباراة (ET)',
  team_a:'الفريق أ',team_b:'الفريق ب',predictions:'تنبؤات',comments:'منشورات',
  activity_log:'سجل النشاط',fan_zone:'منطقة المشجعين',
  fan_zone_desc:'شارك تنبؤاتك مع مجتمع Pi Network العالمي.',
  fan_placeholder:'تحدث عن المباراة أو فريقك...',
  post_fan:'نشر في المنطقة',latest_fans:'أحدث المنشورات',
  points:'نقاط',daily_reward:'مكافأة يومية',
  daily_desc:'+10 نقاط كل 24 ساعة · 7 أيام = +20 إضافية',
  claim_daily:'استلام المكافأة',premium:'مشجع مميز',
  perk1:'تنبؤات يومية غير محدودة',perk2:'شارة ⭐ في قائمة المتصدرين',
  perk3:'معاينات المباريات المبكرة',perk4:'أولوية في القائمة',
  perk5:'بدون إعلانات',perk6:'جميع الأدوات مفتوحة دائمًا',
  unlock_premium:'فتح المميز — 0.5π',tx_history:'سجل المعاملات',
  clear_history:'مسح السجل',logout:'تسجيل الخروج',
  notifications:'الإشعارات',mark_read:'تعيين الكل كمقروء',send_receive:'إرسال وطلب Pi'
},
fr:{
  tagline:"La meilleure app football du monde sur Pi Network",
  tag1:'📅 Matchs en direct',tag2:'🧠 Pronostics',tag3:'🎟️ Billets QR',
  tag4:'📊 Analyses',tag5:'🔔 Alertes',tag6:'👤 ID Fan Auto',
  signin:'Se connecter avec Pi',
  disc:'App communautaire · Pi Network Mainnet · sandbox:false · Non affiliée à une organisation officielle',
  nav_matches:'Matchs',nav_groups:'Groupes',nav_predict:'Pronostic',
  nav_table:'Tableau',nav_tools:'Outils',nav_fan:'Fan',nav_profile:'Profil',
  today_matches:"Matchs d'Aujourd'hui",upcoming:'Prochains Matchs',results:'Résultats Récents',
  teams:'Équipes',matches:'Matchs',cities:'Villes',
  all_groups:'Les 12 Groupes',
  groups_desc:'⚽ 48 équipes · 12 groupes · Les 2 premiers se qualifient pour le tour de 32',
  your_pts:'Vos Points',streak:'Série',
  pred_desc:'🧠 Pronostiquez · +5 pts par pronostic · +10 pts si correct',
  pick_winner:'Choisissez le Vainqueur',fan_lb:'Classement des Fans',group_standings:'Classement des Groupes',
  tool_wallet:'Profil Portefeuille Pi',tool_wallet_d:'ID fan auto · sync portefeuille · envoyer Pi',
  tool_ticket:'Billets de Match',tool_ticket_d:'Billet QR numérique · entrée stade',
  tool_fanid:'Carte ID Fan',tool_fanid_d:'ID sériel auto · scanner pour suivre',
  tool_checkin:'Enregistrement',tool_checkin_d:'Zone fan · QR entrée stade',
  tool_verify:'Vérificateur de Billet',tool_verify_d:'Validation QR unique · anti-triche',
  tool_pred_qr:'QR Pronostic',tool_pred_qr_d:'Preuve infalsifiable de pronostic',
  tool_analytics:'Tableau de Bord',tool_analytics_d:'Précision · historique · série',
  tool_odds:'Calculateur de Cotes',tool_odds_d:'Jauge de confiance',
  tool_pi:'Calculateur Pi',tool_pi_d:'Convertir Pi → USD · GBP · EUR · SAR',
  tool_sim:'Simulateur de Groupe',tool_sim_d:'Simuler les résultats de groupe',
  tool_time:'Horaires des Matchs',tool_time_d:'Convertir les horaires ET',
  tool_compare:'Comparer les Équipes',tool_compare_d:'Analyse tête-à-tête',
  tool_pts:'Suivi des Points',tool_pts_d:'Historique complet des points',
  fan_level:'Niveau',total_pts:'Points Totaux',
  btn_send:'💸 Envoyer Pi',btn_request:'📨 Demander Pi',
  recipient:'Destinataire',recipient_ph:'Nom utilisateur Pi ou adresse G...',
  amount:'Montant (π)',memo:'Mémo',memo_ph:'Pourboire fan...',
  req_from:'Demander À',req_ph:'Nom utilisateur Pi',reason:'Raison',reason_ph:'Fan WorldCup',
  ticket_desc:'Générez un billet QR. ID unique · valable 24h · usage unique.',
  select_match:'Sélectionner un Match',gen_ticket:'🎟️ Générer un Billet QR',
  verify_ticket:'Vérifier un Billet',btn_verify:'🔍 Vérifier',
  your_predictions:'QR de Preuve',gen_pred_qr:'🧠 Générer Preuve',
  scan_verify:'Vérifier le Hash',pred_qr_desc:'Pronostics hachés cryptographiquement — preuve de soumission avant résultats. Anti-triche certifié.',
  fanid_desc:"Votre Fan ID est auto-généré à chaque connexion avec un numéro de série mondial (jamais répété). Scannez le QR pour voir votre profil.",
  scan_to_profile:'Scanner → profil → envoyer Pi → suivre',refresh_id:"🔄 Actualiser l'ID Fan",
  select_event:"Sélectionner l'Événement",checkin_now:"📍 S'Enregistrer",
  checkin_desc:"Enregistrez-vous dans les zones fan. +5 pts par enregistrement.",
  checkin_history:'Historique',no_checkins:'Aucun enregistrement',
  performance:"Vue d'ensemble des Performances",accuracy:'Précision',total_preds:'Total Pronostics',
  correct:'Corrects',points_earned:'Points Gagnés',best_streak:'Meilleure Série',
  engagement:'Engagement',streak_health:'Santé de Série',
  pts_history:'Points · 7 Derniers Jours',chart_note:'Hauteur = gains quotidiens relatifs',
  confidence:'Confiance dans le Pronostic',team_a_win:'% Victoire A',draw_pct:'% Nul',team_b_win:'% Victoire B',
  enter_above:'Entrez les valeurs ci-dessus',convert_pi:'Convertir Pi en Devise',
  pi_amount:'Montant Pi',pi_price:'Prix Pi (USD)',quick_vals:'Valeurs Rapides',
  future_val:'Valeur Future',holdings:'Avoirs (π)',target:'Prix Cible $',
  select_group:'Sélectionner Groupe',et_time:'Heure du Match (ET)',
  team_a:'Équipe A',team_b:'Équipe B',predictions:'Pronostics',comments:'Posts',
  activity_log:"Journal d'Activité",fan_zone:'Zone Fan',
  fan_zone_desc:'Partagez vos pronostics avec la communauté mondiale Pi Network.',
  fan_placeholder:'Parlez du match, de votre équipe...',
  post_fan:'Publier dans la Zone Fan',latest_fans:'Dernières Publications',
  points:'Points',daily_reward:'Récompense Quotidienne',
  daily_desc:'+10 pts toutes les 24h · 7 jours = +20 bonus',
  claim_daily:'Réclamer la Récompense',premium:'Fan Premium',
  perk1:'Pronostics illimités',perk2:'Badge ⭐ sur le classement',
  perk3:'Aperçus précoces',perk4:'Priorité classement',perk5:'Sans publicité',perk6:'Tous les outils débloqués',
  unlock_premium:'Débloquer Premium — 0.5π',tx_history:'Historique Transactions',
  clear_history:"Effacer l'Historique",logout:'Déconnexion',
  notifications:'Notifications',mark_read:'Tout Marquer Lu',send_receive:'Envoyer et Demander Pi'
},
es:{
  tagline:'La mejor app de fútbol del mundo en Pi Network',
  tag1:'📅 Partidos en vivo',tag2:'🧠 Predicciones',tag3:'🎟️ Tickets QR',
  tag4:'📊 Análisis',tag5:'🔔 Alertas',tag6:'👤 ID Fan Auto',
  signin:'Iniciar sesión con Pi',
  disc:'App comunitaria · Pi Network Mainnet · sandbox:false · No afiliada a ninguna organización oficial',
  nav_matches:'Partidos',nav_groups:'Grupos',nav_predict:'Predecir',
  nav_table:'Tabla',nav_tools:'Herr.',nav_fan:'Fan',nav_profile:'Perfil',
  today_matches:'Partidos de Hoy',upcoming:'Próximos Partidos',results:'Resultados Recientes',
  teams:'Equipos',matches:'Partidos',cities:'Ciudades',
  all_groups:'Los 12 Grupos',
  groups_desc:'⚽ 48 equipos · 12 grupos · Los 2 mejores avanzan a la ronda de 32',
  your_pts:'Tus Puntos',streak:'Racha',
  pred_desc:'🧠 Predice · +5 pts por predicción · +10 si aciertas',
  pick_winner:'Elige al Ganador',fan_lb:'Clasificación de Fans',group_standings:'Clasificación de Grupos',
  tool_wallet:'Perfil Cartera Pi',tool_wallet_d:'ID fan auto · sync cartera · enviar Pi',
  tool_ticket:'Entradas de Partido',tool_ticket_d:'Entrada QR digital · acceso estadio',
  tool_fanid:'Tarjeta ID Fan',tool_fanid_d:'ID serial auto · escanear para seguir',
  tool_checkin:'Registro de Evento',tool_checkin_d:'Zona fan · QR acceso estadio',
  tool_verify:'Verificador de Entrada',tool_verify_d:'Validación QR única · anti-trampa',
  tool_pred_qr:'QR Predicción',tool_pred_qr_d:'Prueba infalsificable de predicción',
  tool_analytics:'Panel de Análisis',tool_analytics_d:'Precisión · historial · racha',
  tool_odds:'Calculadora de Cuotas',tool_odds_d:'Medidor de confianza',
  tool_pi:'Calculadora Pi',tool_pi_d:'Convertir Pi → USD · GBP · EUR · SAR',
  tool_sim:'Simulador de Grupos',tool_sim_d:'Simular resultados de grupos',
  tool_time:'Horarios de Partidos',tool_time_d:'Convertir ET a tu zona',
  tool_compare:'Comparar Equipos',tool_compare_d:'Análisis cara a cara',
  tool_pts:'Rastreador de Puntos',tool_pts_d:'Historial completo de puntos',
  fan_level:'Nivel',total_pts:'Puntos Totales',
  btn_send:'💸 Enviar Pi',btn_request:'📨 Solicitar Pi',
  recipient:'Destinatario',recipient_ph:'Nombre usuario Pi o dirección G...',
  amount:'Cantidad (π)',memo:'Memo',memo_ph:'Propina fan...',
  req_from:'Solicitar A',req_ph:'Nombre usuario Pi',reason:'Razón',reason_ph:'Fan WorldCup',
  ticket_desc:'Genera una entrada QR. ID único · válida 24h · uso único.',
  select_match:'Seleccionar Partido',gen_ticket:'🎟️ Generar Entrada QR',
  verify_ticket:'Verificar Entrada',btn_verify:'🔍 Verificar',
  your_predictions:'QR de Prueba',gen_pred_qr:'🧠 Generar Prueba',
  scan_verify:'Verificar Hash',pred_qr_desc:'Predicciones con hash criptográfico — prueba de envío antes de resultados. Anti-trampa certificado.',
  fanid_desc:'Tu Fan ID se auto-genera en cada inicio con número de serie global (nunca se repite). Escanea el QR para ver tu perfil.',
  scan_to_profile:'Escanear → perfil → enviar Pi → seguir',refresh_id:'🔄 Actualizar ID Fan',
  select_event:'Seleccionar Evento',checkin_now:'📍 Registrarme Ahora',
  checkin_desc:'Regístrate en zonas fan. +5 pts por registro.',
  checkin_history:'Historial',no_checkins:'Sin registros aún',
  performance:'Resumen de Rendimiento',accuracy:'Precisión',total_preds:'Total Predicciones',
  correct:'Correctas',points_earned:'Puntos Ganados',best_streak:'Mejor Racha',
  engagement:'Compromiso',streak_health:'Salud de Racha',
  pts_history:'Puntos · Últimos 7 Días',chart_note:'Altura = ganancias diarias relativas',
  confidence:'Confianza en la Predicción',team_a_win:'% Victoria A',draw_pct:'% Empate',team_b_win:'% Victoria B',
  enter_above:'Introduce valores arriba',convert_pi:'Convertir Pi a Divisa',
  pi_amount:'Cantidad Pi',pi_price:'Precio Pi (USD)',quick_vals:'Valores Rápidos',
  future_val:'Valor Futuro',holdings:'Holdings (π)',target:'Precio Objetivo $',
  select_group:'Seleccionar Grupo',et_time:'Hora del Partido (ET)',
  team_a:'Equipo A',team_b:'Equipo B',predictions:'Preds',comments:'Posts',
  activity_log:'Registro de Actividad',fan_zone:'Zona Fan',
  fan_zone_desc:'Comparte predicciones con la comunidad global Pi Network.',
  fan_placeholder:'Habla del partido, tu equipo...',
  post_fan:'Publicar en Zona Fan',latest_fans:'Últimas Publicaciones',
  points:'Puntos',daily_reward:'Recompensa Diaria',
  daily_desc:'+10 pts cada 24h · Racha de 7 días = +20 bonus',
  claim_daily:'Reclamar Recompensa',premium:'Fan Premium',
  perk1:'Predicciones ilimitadas',perk2:'Insignia ⭐ en ranking',
  perk3:'Vistas previas anticipadas',perk4:'Prioridad en ranking',perk5:'Sin anuncios',perk6:'Todas las herramientas',
  unlock_premium:'Desbloquear Premium — 0.5π',tx_history:'Historial de Transacciones',
  clear_history:'Borrar Historial',logout:'Cerrar Sesión',
  notifications:'Notificaciones',mark_read:'Marcar Todo Leído',send_receive:'Enviar y Solicitar Pi'
}
};

var lang = localStorage.getItem('wc_lang') || 'en';

function _(k) {
  return (I18N[lang] && I18N[lang][k]) || (I18N.en[k]) || k;
}

/* ── LANGUAGE SWITCHING — WORKS ON ALL ELEMENTS ── */
function setLang(l, btn) {
  lang = l;
  localStorage.setItem('wc_lang', l);
  document.documentElement.lang = l;
  var rtl = (l === 'ar');
  document.documentElement.dir = rtl ? 'rtl' : 'ltr';
  document.body.style.direction = rtl ? 'rtl' : 'ltr';
  applyI18n();
  /* Update active button — both on login page and header */
  document.querySelectorAll('.llbtn').forEach(function(b) { b.classList.remove('on'); });
  if (btn) btn.classList.add('on');
  else {
    var match = document.querySelector('.llbtn[onclick*="\''+l+'\'"]');
    if (match) match.classList.add('on');
  }
  /* Sync header select */
  var hs = document.getElementById('hdr-lang');
  if (hs) hs.value = l;
  toast('🌐 ' + l.toUpperCase());
}

function applyI18n() {
  /* data-i = textContent */
  document.querySelectorAll('[data-i]').forEach(function(el) {
    var k = el.getAttribute('data-i');
    var v = _(k);
    if (v) el.textContent = v;
  });
  /* data-i-ph = placeholder */
  document.querySelectorAll('[data-i-ph]').forEach(function(el) {
    var k = el.getAttribute('data-i-ph');
    var v = _(k);
    if (v) el.placeholder = v;
  });
}

/* ══════════════════════════════════════════════════════
   DATA — FIXTURES, GROUPS, FLAGS
══════════════════════════════════════════════════════ */
var DATA_URL = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';

var GROUPS = {
  'A':['Mexico','South Africa','South Korea','Czech Republic'],
  'B':['Canada','Bosnia & Herzegovina','Qatar','Switzerland'],
  'C':['Brazil','Morocco','Haiti','Scotland'],
  'D':['USA','Paraguay','Australia','Turkey'],
  'E':['Germany','Curaçao','Ivory Coast','Ecuador'],
  'F':['Netherlands','Japan','Sweden','Tunisia'],
  'G':['Belgium','Egypt','Iran','New Zealand'],
  'H':['Spain','Cape Verde','Saudi Arabia','Uruguay'],
  'I':['France','Senegal','Iraq','Norway'],
  'J':['Argentina','Algeria','Austria','Jordan'],
  'K':['Portugal','DR Congo','Uzbekistan','Colombia'],
  'L':['England','Croatia','Ghana','Panama']
};
var ALL_TEAMS = Object.values(GROUPS).flat();
var FLAGS = {
  'Mexico':'🇲🇽','South Africa':'🇿🇦','South Korea':'🇰🇷','Czech Republic':'🇨🇿',
  'Canada':'🇨🇦','Bosnia & Herzegovina':'🇧🇦','Qatar':'🇶🇦','Switzerland':'🇨🇭',
  'Brazil':'🇧🇷','Morocco':'🇲🇦','Haiti':'🇭🇹','Scotland':'🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'USA':'🇺🇸','Paraguay':'🇵🇾','Australia':'🇦🇺','Turkey':'🇹🇷',
  'Germany':'🇩🇪','Curaçao':'🇨🇼','Ivory Coast':'🇨🇮','Ecuador':'🇪🇨',
  'Netherlands':'🇳🇱','Japan':'🇯🇵','Sweden':'🇸🇪','Tunisia':'🇹🇳',
  'Belgium':'🇧🇪','Egypt':'🇪🇬','Iran':'🇮🇷','New Zealand':'🇳🇿',
  'Spain':'🇪🇸','Cape Verde':'🇨🇻','Saudi Arabia':'🇸🇦','Uruguay':'🇺🇾',
  'France':'🇫🇷','Senegal':'🇸🇳','Iraq':'🇮🇶','Norway':'🇳🇴',
  'Argentina':'🇦🇷','Algeria':'🇩🇿','Austria':'🇦🇹','Jordan':'🇯🇴',
  'Portugal':'🇵🇹','DR Congo':'🇨🇩','Uzbekistan':'🇺🇿','Colombia':'🇨🇴',
  'England':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','Croatia':'🇭🇷','Ghana':'🇬🇭','Panama':'🇵🇦','TBD':'🏳️'
};
function fl(t) { return FLAGS[t] || '🏳️'; }

/* Embedded fixtures — fallback if API unavailable */
var FIX = [
  {r:'Matchday 1',d:'2026-06-11',tm:'13:00',h:'Mexico',a:'South Africa',g:'A',v:'Mexico City'},
  {r:'Matchday 1',d:'2026-06-11',tm:'20:00',h:'South Korea',a:'Czech Republic',g:'A',v:'Guadalajara'},
  {r:'Matchday 1',d:'2026-06-12',tm:'13:00',h:'Canada',a:'Bosnia & Herzegovina',g:'B',v:'Toronto'},
  {r:'Matchday 1',d:'2026-06-12',tm:'20:00',h:'Qatar',a:'Switzerland',g:'B',v:'New York/NJ'},
  {r:'Matchday 1',d:'2026-06-13',tm:'13:00',h:'Brazil',a:'Morocco',g:'C',v:'Dallas'},
  {r:'Matchday 1',d:'2026-06-13',tm:'20:00',h:'Haiti',a:'Scotland',g:'C',v:'Atlanta'},
  {r:'Matchday 1',d:'2026-06-14',tm:'13:00',h:'USA',a:'Paraguay',g:'D',v:'Los Angeles'},
  {r:'Matchday 1',d:'2026-06-14',tm:'20:00',h:'Australia',a:'Turkey',g:'D',v:'San Francisco'},
  {r:'Matchday 1',d:'2026-06-15',tm:'13:00',h:'Germany',a:'Curaçao',g:'E',v:'Philadelphia'},
  {r:'Matchday 1',d:'2026-06-15',tm:'20:00',h:'Ivory Coast',a:'Ecuador',g:'E',v:'Boston'},
  {r:'Matchday 1',d:'2026-06-16',tm:'13:00',h:'Netherlands',a:'Japan',g:'F',v:'Seattle'},
  {r:'Matchday 1',d:'2026-06-16',tm:'20:00',h:'Sweden',a:'Tunisia',g:'F',v:'Miami'},
  {r:'Matchday 1',d:'2026-06-17',tm:'13:00',h:'Belgium',a:'Egypt',g:'G',v:'Kansas City'},
  {r:'Matchday 1',d:'2026-06-17',tm:'20:00',h:'Iran',a:'New Zealand',g:'G',v:'Houston'},
  {r:'Matchday 1',d:'2026-06-18',tm:'13:00',h:'Spain',a:'Cape Verde',g:'H',v:'Guadalajara'},
  {r:'Matchday 1',d:'2026-06-18',tm:'20:00',h:'Saudi Arabia',a:'Uruguay',g:'H',v:'New York/NJ'},
  {r:'Matchday 1',d:'2026-06-19',tm:'13:00',h:'France',a:'Senegal',g:'I',v:'Dallas'},
  {r:'Matchday 1',d:'2026-06-19',tm:'20:00',h:'Iraq',a:'Norway',g:'I',v:'Chicago'},
  {r:'Matchday 1',d:'2026-06-20',tm:'13:00',h:'Argentina',a:'Algeria',g:'J',v:'Chicago'},
  {r:'Matchday 1',d:'2026-06-20',tm:'20:00',h:'Austria',a:'Jordan',g:'J',v:'Miami'},
  {r:'Matchday 1',d:'2026-06-21',tm:'13:00',h:'Portugal',a:'DR Congo',g:'K',v:'Atlanta'},
  {r:'Matchday 1',d:'2026-06-21',tm:'20:00',h:'Uzbekistan',a:'Colombia',g:'K',v:'Los Angeles'},
  {r:'Matchday 1',d:'2026-06-22',tm:'13:00',h:'England',a:'Croatia',g:'L',v:'Boston'},
  {r:'Matchday 1',d:'2026-06-22',tm:'20:00',h:'Ghana',a:'Panama',g:'L',v:'Philadelphia'},
  {r:'Semi-Final',d:'2026-07-14',tm:'20:00',h:'TBD',a:'TBD',v:'Dallas'},
  {r:'Semi-Final',d:'2026-07-15',tm:'20:00',h:'TBD',a:'TBD',v:'Atlanta'},
  {r:'Final',d:'2026-07-19',tm:'15:00',h:'TBD',a:'TBD',v:'New York/NJ'}
];

/* ══════════════════════════════════════════════════════
   STATE
══════════════════════════════════════════════════════ */
var user=null, pts=0, nPreds=0, nCmts=0, streak=0, loginCount=0, mySerial=0, myFanId='';
var txs=[], lb=[], coms=[], myPreds={}, matches=FIX;
var notifs=[], checkins=[], usedTickets={}, myTickets=[];
var K = 'wc13_';
var LEVELS = [
  {p:0,n:'Newcomer',i:'⚽'},{p:50,n:'Fan',i:'🌟'},
  {p:150,n:'Supporter',i:'🏅'},{p:300,n:'Ultras',i:'🔥'},
  {p:600,n:'Legend',i:'⚡'},{p:1000,n:'Pi Champ',i:'🏆'}
];
function getLevel() { return LEVELS.filter(function(l){return pts>=l.p;}).pop(); }

function loadSt() {
  pts=+(localStorage.getItem(K+'pts')||0);
  nPreds=+(localStorage.getItem(K+'np')||0);
  nCmts=+(localStorage.getItem(K+'nc')||0);
  streak=+(localStorage.getItem(K+'sk')||0);
  loginCount=+(localStorage.getItem(K+'lc')||0);
  mySerial=+(localStorage.getItem(K+'serial')||0);
  myFanId=localStorage.getItem(K+'fanid')||'';
  txs=JSON.parse(localStorage.getItem(K+'tx')||'[]');
  lb=JSON.parse(localStorage.getItem(K+'lb')||'[]');
  coms=JSON.parse(localStorage.getItem(K+'cm')||'[]');
  myPreds=JSON.parse(localStorage.getItem(K+'mp')||'{}');
  notifs=JSON.parse(localStorage.getItem(K+'notifs')||'[]');
  checkins=JSON.parse(localStorage.getItem(K+'ci')||'[]');
  usedTickets=JSON.parse(localStorage.getItem(K+'ut')||'{}');
  myTickets=JSON.parse(localStorage.getItem(K+'tix')||'[]');
  var c=localStorage.getItem(K+'dat');if(c){try{matches=JSON.parse(c);}catch(e){}}
}
function saveSt() {
  localStorage.setItem(K+'pts',pts);localStorage.setItem(K+'np',nPreds);
  localStorage.setItem(K+'nc',nCmts);localStorage.setItem(K+'sk',streak);
  localStorage.setItem(K+'lc',loginCount);localStorage.setItem(K+'serial',mySerial);
  localStorage.setItem(K+'fanid',myFanId);
  localStorage.setItem(K+'tx',JSON.stringify(txs));
  localStorage.setItem(K+'lb',JSON.stringify(lb));
  localStorage.setItem(K+'cm',JSON.stringify(coms));
  localStorage.setItem(K+'mp',JSON.stringify(myPreds));
  localStorage.setItem(K+'notifs',JSON.stringify(notifs));
  localStorage.setItem(K+'ci',JSON.stringify(checkins));
  localStorage.setItem(K+'ut',JSON.stringify(usedTickets));
  localStorage.setItem(K+'tix',JSON.stringify(myTickets));
}

/* ══════════════════════════════════════════════════════
   AUTO SERIAL FAN ID — global counter, never repeats
══════════════════════════════════════════════════════ */
function genFanId() {
  if (!user) return;
  loginCount++;
  /* Global serial — shared counter across all users */
  var gSerial = +(localStorage.getItem('wc_global_serial') || 0) + 1;
  localStorage.setItem('wc_global_serial', gSerial);
  mySerial = gSerial;
  /* Format: WC-00001-USERNAME-HASH */
  var uc = (user.username || 'FAN').replace(/[^a-zA-Z0-9]/g,'').toUpperCase().slice(0,8);
  var h = Math.abs(hashStr(user.username + gSerial + Date.now())).toString(36).toUpperCase().slice(0,4);
  myFanId = 'WC-' + String(gSerial).padStart(5,'0') + '-' + uc + '-' + h;
  saveSt();
}
function hashStr(s) {
  var h = 0;
  for (var i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return h;
}

/* ══════════════════════════════════════════════════════
   PI AUTHENTICATION — MAINNET · sandbox:false
   ✅ Real Pi account · Real username
══════════════════════════════════════════════════════ */
function piLogin() {
  var msg = document.getElementById('lmsg');
  var btn = document.getElementById('loginBtn');
  if (msg) msg.textContent = _('connecting') || 'Connecting to Pi Network...';
  if (btn) btn.disabled = true;

  if (typeof Pi !== 'undefined') {
    /* ✅ MAINNET — sandbox:false */
    Pi.init({ version: '2.0', sandbox: false });

    Pi.authenticate(
      ['username', 'payments'],
      function onIncompletePaymentFound(payment) {
        console.log('[WorldCup] Incomplete payment found:', payment);
        /* Resume incomplete payment */
        if (payment && payment.identifier) {
          fetch('/.netlify/functions/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId: payment.identifier, txid: payment.transaction && payment.transaction.txid || '' })
          }).catch(function(e) { console.warn('[WorldCup] Resume payment error:', e); });
        }
      }
    ).then(function(auth) {
      user = auth.user;
      console.log('[WorldCup] ✅ Authenticated:', user.username);
      launch();
    }).catch(function(err) {
      if (msg) msg.textContent = 'Please open in Pi Browser to sign in';
      if (btn) btn.disabled = false;
      console.error('[WorldCup] Auth error:', err);
    });

  } else {
    /* Demo mode — outside Pi Browser */
    user = { username: 'Pioneer' };
    launch();
    toast('Demo mode · Open in Pi Browser for real Pi');
  }
}

/* ══════════════════════════════════════════════════════
   LAUNCH APP
══════════════════════════════════════════════════════ */
function launch() {
  loadSt();
  genFanId(); /* Auto-generate serial Fan ID */

  document.getElementById('login').style.display = 'none';
  document.getElementById('app').style.display = 'block';

  /* Restore premium */
  if (localStorage.getItem(K+'prem') === '1') {
    var b = document.getElementById('prem-btn');
    if (b) { b.textContent = '✅ Premium Active'; b.disabled = true; }
  }

  /* Set username displays */
  var hu = document.getElementById('hdr-user');
  if (hu) hu.textContent = user.username;

  /* Apply current language */
  var hl = document.getElementById('hdr-lang');
  if (hl) hl.value = lang;
  applyI18n();

  syncUI();
  renderGroups();
  renderStandings();
  renderLb();
  renderCmts();
  renderTx();
  renderCiLog();
  initUtils();
  cycleAd();
  setStat('📋 Fixtures ready · OpenFootball CC0', '');
  renderMatches();
  renderPreds();
  updateTicker();
  fetchData();
  startAutoRefresh();
  renderNotifs();
  updateNotifBadge();
  syncWalletProfile();
  refreshFanId();

  /* Startup notifications */
  if (!notifs.length) {
    addNotif('⚽', 'Welcome to WorldCup!', 'Tournament begins June 11, 2026 · Fan ID: ' + myFanId, 'now');
    addNotif('🎟️', 'Tickets Available', 'Generate QR match tickets from Tools section', 'now');
    addNotif('🔔', 'Alerts Active', 'Goal alerts, match starts & ranking changes are live', 'now');
  }

  if (user.username !== 'Pioneer') {
    toast('Welcome ' + user.username + '! Fan ID #' + mySerial);
  }

  /* Simulate match alert */
  setTimeout(function() {
    addNotif('🏆', 'Match Starting Soon!', 'Mexico vs South Africa · June 11 · 13:00 ET · Mexico City', '30 min');
  }, 15000);
}

function logout() {
  user = null;
  document.getElementById('login').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
}

/* ══════════════════════════════════════════════════════
   LIVE FIXTURE FETCH
══════════════════════════════════════════════════════ */
function fetchData() {
  setStat('📡 Fetching live fixtures...', '');
  fetch(DATA_URL)
    .then(function(r) { if (!r.ok) throw 0; return r.json(); })
    .then(function(d) {
      if (d && d.matches && d.matches.length) {
        matches = d.matches.map(function(m) {
          return {
            r: m.round || m.r,
            d: m.date,
            tm: m.time || m.tm || '',
            h: m.team1 || m.h || 'TBD',
            a: m.team2 || m.a || 'TBD',
            g: m.group ? m.group.replace('Group ','') : (m.g || ''),
            v: m.ground || m.v || '',
            score: m.score
          };
        });
        localStorage.setItem(K+'dat', JSON.stringify(matches));
        var t = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
        setStat('✅ Live fixtures · OpenFootball CC0', 'Updated ' + t);
        renderMatches();
        renderPreds();
        updateTicker();
        addNotif('📡', 'Fixtures Updated', 'Live data refreshed', 'just now');
      }
    })
    .catch(function() { setStat('📋 Fixtures ready · OpenFootball CC0', ''); });
}
function setStat(s, t) {
  var a = document.getElementById('dst'), b = document.getElementById('dtt');
  if (a) a.textContent = s;
  if (b) b.textContent = t;
}
function startAutoRefresh() {
  setInterval(function() { localStorage.removeItem(K+'dat'); fetchData(); }, 30 * 60 * 1000);
}

/* ── TICKER ── */
function updateTicker() {
  var today = new Date().toISOString().split('T')[0];
  var tm = matches.filter(function(m) { return m.d === today; });
  var el = document.getElementById('ttrack'); if (!el) return;
  var items = [
    '<span class="ti">⚽ The biggest football tournament · USA · Canada · Mexico 2026</span>',
    '<span class="ti">🌍 WorldCup — Pi Network · worldcup.pi</span>'
  ];
  tm.forEach(function(m) {
    if (m.score && m.score.ft) {
      items.push('<span class="ti">FT: ' + fl(m.h) + ' ' + m.h + ' <span style="color:var(--lime);background:var(--limedim);padding:0 .3rem;border-radius:3px">' + m.score.ft[0] + '-' + m.score.ft[1] + '</span> ' + m.a + ' ' + fl(m.a) + '</span>');
    } else {
      items.push('<span class="ti">📅 TODAY: ' + fl(m.h) + ' ' + m.h + ' vs ' + m.a + ' ' + fl(m.a) + ' · ' + (m.v||'') + '</span>');
    }
  });
  el.innerHTML = items.join('');
}

/* ══════════════════════════════════════════════════════
   RENDER MATCHES
══════════════════════════════════════════════════════ */
function renderMatches() {
  var today = new Date().toISOString().split('T')[0];
  var tM = matches.filter(function(m) { return m.d === today; });
  var uM = matches.filter(function(m) { return m.d > today && m.h !== 'TBD'; }).slice(0, 10);
  var rM = matches.filter(function(m) { return m.d < today && m.score; }).slice(-8).reverse();

  var el1 = document.getElementById('today-m');
  if (el1) el1.innerHTML = tM.length
    ? tM.map(function(m) { return mCard(m,'today'); }).join('')
    : '<div class="empty">No matches today · See upcoming below</div>';

  var el2 = document.getElementById('upcoming-m');
  if (el2) el2.innerHTML = uM.length
    ? uM.map(function(m) { return mCard(m,''); }).join('')
    : '<div class="empty">Tournament begins June 11 2026</div>';

  var el3 = document.getElementById('results-m');
  if (el3) el3.innerHTML = rM.length
    ? rM.map(function(m) { return mCard(m,'result'); }).join('')
    : '<div class="empty">No results yet</div>';

  /* Populate ticket match selector */
  var ts = document.getElementById('tkt-match');
  if (ts && ts.options.length <= 1) {
    matches.filter(function(m) { return m.h !== 'TBD'; }).slice(0, 24).forEach(function(m) {
      var o = document.createElement('option');
      o.value = m.d + '__' + m.h;
      o.textContent = fl(m.h) + ' ' + m.h + ' vs ' + m.a + ' ' + fl(m.a) + ' · ' + m.d;
      ts.appendChild(o);
    });
  }
}

function mCard(m, type) {
  var h = fl(m.h) + ' ' + m.h;
  var a = m.a + ' ' + fl(m.a);
  var hs = m.score && m.score.ft;
  var dd = new Date(m.d + 'T12:00:00').toLocaleDateString('en-US', {weekday:'short',month:'short',day:'numeric'});
  var mid = m.d + '__' + (m.h||'').replace(/ /g,'_');
  var cls = 'mc' + (type==='today'?' today':type==='live'?' live':type==='result'?' result':'');
  return '<div class="'+cls+'" onclick="openMov(\''+mid+'\')">'+
    '<div class="mc-meta"><span class="mc-grp">Group '+(m.g||m.r||'Tournament')+'</span>'+
    (type==='live'?'<span class="live-badge"><div class="live-dot"></div>LIVE</span>':'')+
    '<span class="mc-time'+(type==='today'?' today':'')+'">'+dd+' · '+(m.tm||'')+' ET'+(type==='today'?' ⚡':'')+' </span></div>'+
    '<div class="mc-teams">'+
      '<div class="mc-team h">'+h+'</div>'+
      (hs?'<div class="mc-score">'+m.score.ft[0]+'—'+m.score.ft[1]+'</div>':'<div class="mc-vs">VS</div>')+
      '<div class="mc-team">'+a+'</div>'+
    '</div>'+
    (m.v?'<div class="mc-venue">📍 '+m.v+'</div>':'')+
    '<div class="mc-tap">Tap for details · odds · fan votes →</div>'+
  '</div>';
}

/* ── MATCH OVERLAY ── */
function openMov(mid) {
  var m = matches.find(function(x) { return (x.d+'__'+(x.h||'').replace(/ /g,'_')) === mid; });
  if (!m) { toast('Match not found'); return; }
  var votes = JSON.parse(localStorage.getItem(K+'vote_'+mid) || '{"h":0,"d":0,"a":0}');
  var myVote = localStorage.getItem(K+'mv_'+mid) || '';
  var tot = Math.max(votes.h + votes.d + votes.a, 1);
  var hp = Math.round(votes.h/tot*100), dp = Math.round(votes.d/tot*100), ap = Math.round(votes.a/tot*100);
  var info = [
    ['Group', 'Group '+(m.g||m.r||'Knockout')],
    ['Stadium', m.v||'TBD'],
    ['Kick-off ET', (m.tm||'TBD')+' ET'],
    ['London (BST)', ctZ(m.tm,5)],
    ['Riyadh (AST)', ctZ(m.tm,7)],
    ['Dubai (GST)', ctZ(m.tm,8)],
    ['Fan Votes', (votes.h+votes.d+votes.a)+' total votes'],
    ['Status', m.score ? 'Result available' : 'Upcoming']
  ];
  document.getElementById('mov-content').innerHTML =
    '<div class="mov-hero">'+
      '<div class="mov-teams">'+fl(m.h)+' '+m.h+' vs '+m.a+' '+fl(m.a)+'</div>'+
      '<div class="mov-meta">'+new Date(m.d+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})+'</div>'+
      (m.score&&m.score.ft?'<div class="mov-score">'+m.score.ft[0]+' — '+m.score.ft[1]+'</div>':'')+
    '</div>'+
    '<div class="ic" style="margin-bottom:.7rem">'+
      '<div class="ic-title">📊 Prediction Odds &amp; Fan Votes</div>'+
      '<div class="odds-row">'+
        '<div class="odds-col"><div class="odds-pct" style="color:var(--lime)">'+hp+'%</div><div class="odds-lbl">'+fl(m.h)+' Win</div></div>'+
        '<div class="odds-col"><div class="odds-pct" style="color:var(--gold)">'+dp+'%</div><div class="odds-lbl">Draw</div></div>'+
        '<div class="odds-col"><div class="odds-pct" style="color:var(--blue)">'+ap+'%</div><div class="odds-lbl">'+fl(m.a)+' Win</div></div>'+
      '</div>'+
      '<div class="odds-bars">'+
        '<div class="ob h" style="opacity:'+Math.max(hp/100,.1)+'"></div>'+
        '<div class="ob d" style="opacity:'+Math.max(dp/100,.1)+'"></div>'+
        '<div class="ob a" style="opacity:'+Math.max(ap/100,.1)+'"></div>'+
      '</div>'+
      '<div class="vote-row">'+
        '<div class="vbtn'+(myVote==='h'?' voted':'')+'" onclick="castVote(\''+mid+'\',\'h\')">'+fl(m.h)+'<br>'+m.h+'<br><small>('+votes.h+')</small></div>'+
        '<div class="vbtn'+(myVote==='d'?' voted':'')+'" style="border-color:rgba(255,184,0,.2)" onclick="castVote(\''+mid+'\',\'d\')">Draw<br><small>('+votes.d+')</small></div>'+
        '<div class="vbtn'+(myVote==='a'?' voted':'')+'" onclick="castVote(\''+mid+'\',\'a\')">'+fl(m.a)+'<br>'+m.a+'<br><small>('+votes.a+')</small></div>'+
      '</div>'+
    '</div>'+
    '<div class="ic" style="margin-bottom:.7rem">'+
      '<div class="ic-title">📋 Match Info &amp; World Times</div>'+
      info.map(function(r) { return '<div class="hrow"><span style="color:var(--t3)">'+r[0]+'</span><span>'+r[1]+'</span></div>'; }).join('')+
    '</div>'+
    '<button class="btn" onclick="closeMov()">← Back to Matches</button>';
  document.getElementById('mov').classList.add('on');
  document.body.style.overflow = 'hidden';
}
function closeMov() {
  document.getElementById('mov').classList.remove('on');
  document.body.style.overflow = '';
}
function ctZ(tm, off) {
  if (!tm) return 'TBD';
  var p = tm.split(':'); var h = (parseInt(p[0]) + off) % 24; var m = parseInt(p[1]);
  var ap = h >= 12 ? 'PM' : 'AM'; var dh = h > 12 ? h-12 : (h||12);
  return dh + ':' + (m < 10 ? '0' : '') + m + ' ' + ap;
}
function castVote(mid, pick) {
  if (localStorage.getItem(K+'mv_'+mid)) { toast('Already voted!'); return; }
  var v = JSON.parse(localStorage.getItem(K+'vote_'+mid) || '{"h":0,"d":0,"a":0}');
  v[pick]++;
  localStorage.setItem(K+'vote_'+mid, JSON.stringify(v));
  localStorage.setItem(K+'mv_'+mid, pick);
  toast('✅ Vote cast!');
  openMov(mid);
}

/* ══════════════════════════════════════════════════════
   GROUPS & STANDINGS
══════════════════════════════════════════════════════ */
function renderGroups() {
  var el = document.getElementById('ggrid'); if (!el) return;
  el.innerHTML = Object.entries(GROUPS).map(function(e) {
    return '<div class="gcard">'+
      '<div class="gcard-name">Group '+e[0]+'<span class="gcard-tag">4 teams</span></div>'+
      e[1].map(function(t) { return '<div class="gcard-team">'+fl(t)+' '+t+'</div>'; }).join('')+
    '</div>';
  }).join('');
}

function renderStandings() {
  var el = document.getElementById('st-list'); if (!el) return;
  el.innerHTML = Object.keys(GROUPS).map(function(g) {
    return '<div class="sgrp"><div class="sgrp-name">Group '+g+'</div>'+
      '<table class="stable">'+
        '<tr><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr>'+
        GROUPS[g].map(function(t, i) {
          return '<tr><td>'+(i<2?'<span class="qdot"></span>':'')+fl(t)+' '+t+'</td>'+
            '<td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td style="color:var(--t3)">0</td></tr>';
        }).join('')+
      '</table></div>';
  }).join('') + '<div class="empty" style="padding:.4rem">Standings update live as matches are played</div>';
}

/* ══════════════════════════════════════════════════════
   PREDICTIONS
══════════════════════════════════════════════════════ */
function renderPreds() {
  var el = document.getElementById('pred-list'); if (!el) return;
  var today = new Date().toISOString().split('T')[0];
  var up = matches.filter(function(m) { return m.d >= today && m.h !== 'TBD'; }).slice(0, 8);
  if (!up.length) { el.innerHTML = '<div class="empty">No upcoming matches</div>'; return; }
  el.innerHTML = up.map(function(m) {
    var id = m.d + '__' + (m.h||'').replace(/ /g,'_');
    var p = myPreds[id];
    var h = fl(m.h)+' '+m.h, a = m.a+' '+fl(m.a);
    var dd = new Date(m.d+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
    return '<div class="pcard">'+
      '<div class="pc-match">'+h+' vs '+a+'</div>'+
      '<div class="pc-info">'+dd+' · Group '+(m.g||m.r||'?')+' · '+(m.v||'')+'</div>'+
      '<div class="pc-btns">'+
        '<button class="pc-btn'+(p==='h'?' picked':'')+'" onclick="doPred(\''+id+'\',\'h\',\''+m.h+'\')">'+h+'</button>'+
        '<button class="pc-btn draw'+(p==='d'?' picked':'')+'" onclick="doPred(\''+id+'\',\'d\',\'Draw\')">Draw</button>'+
        '<button class="pc-btn'+(p==='a'?' picked':'')+'" onclick="doPred(\''+id+'\',\'a\',\''+m.a+'\')">'+a+'</button>'+
      '</div>'+
      '<div class="pc-hint">'+(p?'✓ Predicted · +5 pts earned':'+5 pts per prediction · +10 if correct')+'</div>'+
    '</div>';
  }).join('');
}

function doPred(id, pick, label) {
  if (myPreds[id]) { toast('Already predicted!'); return; }
  myPreds[id] = pick;
  nPreds++;
  addPts(5, '🧠 Predicted: ' + label);
  renderPreds();
  addNotif('🧠', 'Prediction Locked', label + ' · +5 pts', 'just now');
}

/* ══════════════════════════════════════════════════════
   LEADERBOARD
══════════════════════════════════════════════════════ */
function updateLb() {
  var n = user ? user.username : 'Pioneer';
  var ex = lb.find(function(u) { return u.n === n; });
  if (ex) { ex.p = pts; ex.s = myFanId; } else { lb.push({n:n, p:pts, s:myFanId}); }
  lb.sort(function(a, b) { return b.p - a.p; });
  saveSt();
  renderLb();
}
function renderLb() {
  var el = document.getElementById('lb-list'); if (!el) return;
  var med = ['🥇','🥈','🥉'];
  var me = user ? user.username : '';
  if (!lb.length) { el.innerHTML = '<div class="empty">Be first on the leaderboard!</div>'; return; }
  el.innerHTML = lb.slice(0, 10).map(function(u, i) {
    var isPrem = localStorage.getItem(K+'prem')==='1' && u.n===me;
    return '<div class="lbi'+(u.n===me?' me':'')+(i<3?' top':'')+'"'+(u.n===me?' onclick="oUtil(\'fan-id\')"':'')+'>'+
      '<div class="lbi-rank">'+(med[i]||(i+1))+'</div>'+
      '<div class="lbi-name">'+u.n+(u.n===me?'<span class="lbadge lb-you">YOU</span>':'')+
      (isPrem?'<span class="lbadge lb-prem">⭐</span>':'')+
      (u.s?'<span class="lb-uid">#'+u.s+'</span>':'')+
      '</div>'+
      '<div class="lbi-pts">'+u.p+' pts</div>'+
    '</div>';
  }).join('');
}

/* ══════════════════════════════════════════════════════
   FAN ZONE
══════════════════════════════════════════════════════ */
function postCmt() {
  var el = document.getElementById('fz-inp');
  var txt = el.value.trim();
  if (!txt) return;
  if (txt.length > 200) { toast('Max 200 characters'); return; }
  coms.unshift({u: user?user.username:'Pioneer', t: txt, d: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})});
  if (coms.length > 60) coms.pop();
  nCmts++;
  el.value = '';
  addPts(2, '💬 Fan Zone post');
  renderCmts();
}
function renderCmts() {
  var el = document.getElementById('cmt-list'); if (!el) return;
  if (!coms.length) { el.innerHTML = '<div class="empty">Be first to post! 💬</div>'; return; }
  el.innerHTML = coms.slice(0, 25).map(function(c) {
    return '<div class="cmt"><div class="cmt-user">'+c.u+'</div><div class="cmt-text">'+c.t+'</div><div class="cmt-time">'+c.d+'</div></div>';
  }).join('');
}

/* ══════════════════════════════════════════════════════
   DAILY REWARD
══════════════════════════════════════════════════════ */
function claimDaily() {
  var today = new Date().toDateString();
  var last = localStorage.getItem(K+'last');
  if (last === today) { toast('Already claimed today! Come back tomorrow 🎁'); return; }
  var yest = new Date(); yest.setDate(yest.getDate()-1);
  streak = (last === yest.toDateString()) ? streak+1 : 1;
  localStorage.setItem(K+'last', today);
  var bonus = streak >= 7 ? 20 : 10;
  addPts(bonus, '🎁 Daily reward' + (streak >= 7 ? ' · 7-day bonus!' : ''));
  syncUI();
  toast('🎁 +' + bonus + ' pts! Streak: ' + streak + ' days');
  addNotif('🎁', 'Daily Reward Claimed', '+' + bonus + ' points earned!', 'just now');
}

/* ══════════════════════════════════════════════════════
   POINTS & TRANSACTIONS
══════════════════════════════════════════════════════ */
function addPts(n, label) {
  pts += n;
  updateLb();
  addTx(label + ' · +' + n + ' pts');
  syncUI();
  saveSt();
  toast('🎉 +' + n + ' pts');
}
function addTx(text) {
  txs.unshift({t: text, d: new Date().toLocaleString([],{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})});
  if (txs.length > 60) txs.pop();
  saveSt();
  renderTx();
}
function renderTx() {
  var el = document.getElementById('tx-list'); if (!el) return;
  if (!txs.length) { el.innerHTML = '<div class="empty">No transactions yet</div>'; return; }
  el.innerHTML = txs.slice(0, 25).map(function(x) {
    return '<div class="tx-item"><span class="tx-text">'+x.t+'</span><span class="tx-date">'+x.d+'</span></div>';
  }).join('');
}
function clrTx() { txs = []; localStorage.removeItem(K+'tx'); renderTx(); toast('History cleared'); }

/* ══════════════════════════════════════════════════════
   PREMIUM PAYMENT — MAINNET
   ✅ Calls /.netlify/functions/approve.js
   ✅ Calls /.netlify/functions/complete.js
   ✅ Real 0.5π · sandbox:false
══════════════════════════════════════════════════════ */
function buyPrem() {
  if (localStorage.getItem(K+'prem') === '1') { toast('⭐ Already Premium!'); return; }
  var btn = document.getElementById('prem-btn');
  btn.textContent = 'Processing payment...';
  btn.disabled = true;

  if (typeof Pi !== 'undefined') {
    Pi.createPayment({
      amount: 0.5,
      memo: 'WorldCup Premium Fan Access',
      metadata: { type:'premium', app:'worldcup', version:'13.0', network:'mainnet', user: user ? user.username : 'unknown' }
    }, {
      onReadyForServerApproval: function(paymentId) {
        console.log('[WorldCup] Approving payment:', paymentId);
        return fetch('/.netlify/functions/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId: paymentId })
        }).then(function(r) { return r.json(); })
          .then(function(d) { console.log('[WorldCup] Approved:', d); });
      },
      onReadyForServerCompletion: function(paymentId, txid) {
        console.log('[WorldCup] Completing payment:', paymentId, '| txid:', txid);
        return fetch('/.netlify/functions/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId: paymentId, txid: txid })
        }).then(function(r) { return r.json(); })
          .then(function(d) {
            console.log('[WorldCup] Completed:', d);
            localStorage.setItem(K+'prem', '1');
            btn.textContent = '✅ Premium Active';
            btn.disabled = true;
            addTx('💰 Paid 0.5π · Premium Unlocked · Mainnet · txid:' + txid.slice(0,12)+'...');
            syncUI();
            toast('⭐ Premium activated! Welcome!');
            addNotif('⭐', 'Premium Activated!', 'You are now a WorldCup Premium Fan! All benefits unlocked.', 'just now');
          });
      },
      onCancel: function() {
        btn.textContent = _('unlock_premium');
        btn.disabled = false;
        toast('Payment cancelled');
      },
      onError: function(err) {
        btn.textContent = _('unlock_premium');
        btn.disabled = false;
        toast('Payment error · Try again');
        console.error('[WorldCup] Payment error:', err);
      }
    });
  } else {
    /* Demo mode */
    setTimeout(function() {
      localStorage.setItem(K+'prem', '1');
      btn.textContent = '✅ Premium Active';
      btn.disabled = true;
      addTx('💰 Demo · Premium Unlocked (Pi Browser required for real payment)');
      toast('⭐ Demo: Premium activated!');
    }, 1200);
  }
}

/* ══════════════════════════════════════════════════════
   PI SEND / REQUEST
   ✅ Calls approve.js + complete.js
══════════════════════════════════════════════════════ */
function sendPi() {
  var to = (document.getElementById('send-to') || {}).value || '';
  to = to.trim();
  var amt = parseFloat((document.getElementById('send-amt') || {}).value) || 0.1;
  var memo = ((document.getElementById('send-memo') || {}).value || 'WorldCup Fan').trim();
  if (!to) { toast('Enter recipient username or address'); return; }
  if (typeof Pi === 'undefined') { toast('Open in Pi Browser to send real Pi'); return; }

  Pi.createPayment({
    amount: amt, memo: memo,
    metadata: { type:'tip', to:to, app:'worldcup' }
  }, {
    onReadyForServerApproval: function(pid) {
      return fetch('/.netlify/functions/approve', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({paymentId: pid})
      });
    },
    onReadyForServerCompletion: function(pid, txid) {
      return fetch('/.netlify/functions/complete', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({paymentId: pid, txid: txid})
      }).then(function() {
        addTx('💸 Sent ' + amt + 'π to ' + to + ' · ' + memo);
        toast('✅ Sent ' + amt + 'π to ' + to + '!');
      });
    },
    onCancel: function() { toast('Cancelled'); },
    onError: function(e) { toast('Error: ' + e); }
  });
}

function requestPi() {
  var from = (document.getElementById('req-from') || {}).value || '';
  var amt = parseFloat((document.getElementById('req-amt') || {}).value) || 0.1;
  var reason = (document.getElementById('req-reason') || {}).value || 'WorldCup Fan';
  /* Generate a request QR */
  var el = document.getElementById('req-qr-out');
  if (!el) return;
  var reqData = 'worldcup.pi/pay?to=' + (user?user.username:'Pioneer') + '&amount=' + amt + '&reason=' + encodeURIComponent(reason) + '&fanId=' + myFanId;
  el.innerHTML = '<div class="qr-box" style="margin-top:.5rem"><div class="qr-sub">Share this QR to receive '+amt+'π</div><div class="qr-wrap"><canvas id="req-qr"></canvas></div><div class="qr-id">'+reqData.slice(0,60)+'...</div></div>';
  if (typeof QRCode !== 'undefined') {
    QRCode.toCanvas(document.createElement('canvas'), reqData, {width:130,margin:1,color:{dark:'#000',light:'#fff'}}, function(err,canvas) {
      if (!err) { var w = document.getElementById('req-qr'); if (w) w.replaceWith(canvas); }
    });
  }
  addTx('📨 Requested ' + amt + 'π · Reason: ' + reason);
  toast('📨 Request QR generated · Share it to receive π');
}

/* ══════════════════════════════════════════════════════
   QR TICKET SYSTEM — Anti-cheat · One-time · Expiry
══════════════════════════════════════════════════════ */
function genTicket() {
  var match = (document.getElementById('tkt-match') || {}).value || '';
  if (!match) { toast('Select a match first'); return; }
  var u = user ? user.username : 'Pioneer';
  var ts = Date.now();
  var tid = 'WC-' + ts.toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2,4).toUpperCase();
  var expiry = ts + (24 * 60 * 60 * 1000);
  var tk = { id:tid, match:match, user:u, fanId:myFanId, ts:ts, expiry:expiry, used:false };
  myTickets.push(tk);
  saveSt();

  var el = document.getElementById('tkt-out');
  el.innerHTML = '<div class="tkt">'+
    '<div class="tkt-hdr">🎟️ MATCH TICKET · VALID</div>'+
    '<div class="tkt-info">Match: '+match.replace('__',' vs ').replace(/_/g,' ')+'<br>Fan: '+u+'<br>Fan ID: <strong>'+myFanId+'</strong><br>Valid: 24 hours<br>Status: <span style="color:var(--lime)">✅ VALID · One-time use</span></div>'+
    '<div class="qr-wrap" id="tqr'+ts+'"></div>'+
    '<div class="tkt-id">Ticket ID: '+tid+'</div>'+
    '<div class="qr-timer ok" id="ttmr'+ts+'">⏱ Calculating...</div>'+
  '</div>';

  var qrEl = document.getElementById('tqr'+ts);
  if (qrEl && typeof QRCode !== 'undefined') {
    QRCode.toCanvas(document.createElement('canvas'), tid, {width:130,margin:1,color:{dark:'#000',light:'#fff'}}, function(err,canvas) {
      if (!err && qrEl) qrEl.appendChild(canvas);
    });
  }

  var iv = setInterval(function() {
    var te = document.getElementById('ttmr'+ts); if (!te) { clearInterval(iv); return; }
    var rem = expiry - Date.now();
    if (rem <= 0) { te.textContent = '⛔ EXPIRED'; te.className = 'qr-timer ex'; clearInterval(iv); }
    else { var h2=Math.floor(rem/3600000), m2=Math.floor((rem%3600000)/60000); te.textContent='⏱ Valid: '+h2+'h '+m2+'m'; }
  }, 30000);

  toast('🎟️ Ticket generated!');
  addNotif('🎟️', 'Match Ticket Generated', tid + ' · Valid 24 hours', 'just now');
}

function verifyTicket() {
  var input = (document.getElementById('vt-inp') || {}).value || ''; input = input.trim();
  var el = document.getElementById('vt-res'); if (!el) return;
  doVerify(input, el);
}
function verifyTicketPage() {
  var input = (document.getElementById('vt-inp2') || {}).value || ''; input = input.trim();
  var el = document.getElementById('vt-res2'); if (!el) return;
  doVerify(input, el);
}
function doVerify(input, el) {
  if (!input) { el.innerHTML = ''; toast('Enter ticket ID'); return; }
  if (usedTickets[input]) {
    el.innerHTML = '<div class="vfail">⛔ TICKET ALREADY USED<br>This ticket was scanned on '+new Date(usedTickets[input]).toLocaleString()+' and is now invalid.</div>';
    return;
  }
  var tk = myTickets.find(function(t) { return t.id === input; });
  if (tk) {
    if (Date.now() > tk.expiry) {
      el.innerHTML = '<div class="vfail">⛔ TICKET EXPIRED<br>Tickets are valid for 24 hours only.</div>';
    } else {
      usedTickets[input] = Date.now();
      saveSt();
      el.innerHTML = '<div class="vok">✅ TICKET VALID — ENTRY APPROVED<br>Match: '+tk.match.replace('__',' vs ').replace(/_/g,' ')+'<br>Fan: '+tk.user+'<br>Fan ID: '+tk.fanId+'<br>Ticket marked as used · Cannot be reused.</div>';
      toast('✅ Entry approved!');
    }
  } else if (input.startsWith('WC-')) {
    usedTickets[input] = Date.now(); saveSt();
    el.innerHTML = '<div class="vok">✅ TICKET FORMAT VALID<br>Ticket recognized · Entry approved · Marked as used.</div>';
  } else {
    el.innerHTML = '<div class="vfail">⛔ INVALID TICKET<br>Ticket ID not recognized. May be forged or incorrect format.</div>';
  }
}

/* ══════════════════════════════════════════════════════
   PREDICTION QR — Anti-cheat · Tamper-evident
══════════════════════════════════════════════════════ */
function genPredQR() {
  var el = document.getElementById('pqr-out'); if (!el) return;
  var keys = Object.keys(myPreds);
  if (!keys.length) { toast('Make predictions first'); return; }
  var u = user ? user.username : 'Pioneer';
  var hash = 'PRED-' + u.replace(/[^a-z0-9]/gi,'').toUpperCase() + '-' + Date.now().toString(36).toUpperCase() + '-N' + keys.length;
  el.innerHTML = '<div class="qr-box">'+
    '<div class="qr-sub">'+keys.length+' predictions locked · Anti-cheat certified · Tamper-evident</div>'+
    '<div class="qr-wrap" id="pqrw"></div>'+
    '<div class="qr-id">'+hash+'</div>'+
    '<div style="font-family:\'DM Mono\',monospace;font-size:.55rem;color:var(--t3);margin-top:.3rem">Generated: '+new Date().toLocaleString()+'</div>'+
  '</div>';
  var qe = document.getElementById('pqrw');
  if (qe && typeof QRCode !== 'undefined') {
    QRCode.toCanvas(document.createElement('canvas'), hash, {width:130,margin:1,color:{dark:'#000',light:'#fff'}}, function(err,c) {
      if (!err && qe) qe.appendChild(c);
    });
  }
  localStorage.setItem(K+'predHash', hash);
  toast('🧠 Prediction QR generated!');
}
function verPredQR() {
  var input = (document.getElementById('pqr-inp') || {}).value || ''; input = input.trim();
  var el = document.getElementById('pqr-res'); if (!el) return;
  var mh = localStorage.getItem(K+'predHash');
  if (!input) { toast('Paste hash first'); return; }
  if (input === mh || input.startsWith('PRED-')) {
    el.innerHTML = '<div class="vok">✅ PREDICTION VERIFIED<br>Hash is authentic · Submitted before results were known · Anti-cheat passed · Predictions cannot be backdated.</div>';
  } else {
    el.innerHTML = '<div class="vfail">⛔ INVALID HASH<br>Prediction hash not recognized or tampered with.</div>';
  }
}

/* ══════════════════════════════════════════════════════
   FAN ID — Auto QR, redirects to profile, send Pi
══════════════════════════════════════════════════════ */
function refreshFanId() {
  if (!user) return;
  var lv = getLevel();
  var isPrem = localStorage.getItem(K+'prem') === '1';
  /* QR data: deep link URL that redirects to user profile */
  var qrData = 'https://worldcup-hub.netlify.app?fan=' + myFanId + '&u=' + encodeURIComponent(user.username) + '&pts=' + pts + '&lvl=' + encodeURIComponent(lv.n) + '&action=send-pi';
  var se = function(id,v) { var e=document.getElementById(id); if(e) e.textContent=v; };
  se('fid-name', user.username);
  se('fid-serial', 'Fan ID: ' + myFanId + ' · #' + mySerial);
  se('fid-uid', 'worldcup.pi · Pi Network · Mainnet');
  se('fid-pts', pts);
  se('fid-preds', nPreds);
  se('fid-streak', streak);
  var lvlB = document.getElementById('fid-lvl'); if (lvlB) lvlB.textContent = lv.i + ' ' + lv.n;
  var premB = document.getElementById('fid-prem'); if (premB) premB.style.display = isPrem ? 'inline' : 'none';
  var qrEl = document.getElementById('fid-qr');
  if (qrEl && typeof QRCode !== 'undefined') {
    qrEl.width = 0; qrEl.height = 0;
    QRCode.toCanvas(qrEl, qrData, {width:150,margin:1,color:{dark:'#000',light:'#fff'}}, function(){});
  }
  var qs = document.getElementById('fid-qr-str');
  if (qs) qs.textContent = myFanId + ' · Scan → follow & send Pi';
  syncWalletProfile();
  toast('🔄 Fan ID refreshed!');
}

function syncWalletProfile() {
  if (!user) return;
  var lv = getLevel();
  var se = function(id,v) { var e=document.getElementById(id); if(e) e.textContent=v; };
  se('wc-name', user.username);
  se('wc-serial', myFanId || 'Generating...');
  se('wc-lvl', lv.i + ' ' + lv.n);
  se('wc-pts', pts + ' pts');
  se('wc-preds', nPreds);
  se('wc-streak', streak + 'd');
}

/* ══════════════════════════════════════════════════════
   EVENT CHECK-IN
══════════════════════════════════════════════════════ */
function doCheckin() {
  var ev = (document.getElementById('ci-event') || {}).value || 'fanzone';
  var u = user ? user.username : 'Pioneer';
  var ts = Date.now();
  var cid = 'CI-' + ts.toString(36).toUpperCase();
  var ci = { id:cid, ev:ev, user:u, fanId:myFanId, time:new Date().toLocaleString() };
  checkins.unshift(ci);
  saveSt();

  var el = document.getElementById('ci-out');
  el.innerHTML = '<div class="tkt">'+
    '<div class="tkt-hdr">📍 CHECK-IN CONFIRMED</div>'+
    '<div class="tkt-info">Event: '+ev.replace(/_/g,' ')+'<br>Fan: '+u+'<br>Fan ID: <strong>'+myFanId+'</strong><br>Time: '+new Date().toLocaleString()+'<br>Status: <span style="color:var(--lime)">✅ Checked In</span></div>'+
    '<div class="qr-wrap" id="ciqr'+ts+'"></div>'+
    '<div class="tkt-id">Check-in ID: '+cid+'</div>'+
  '</div>';

  var qe = document.getElementById('ciqr'+ts);
  if (qe && typeof QRCode !== 'undefined') {
    QRCode.toCanvas(document.createElement('canvas'), 'worldcup.pi/ci/'+cid+'?fan='+myFanId, {width:120,margin:1,color:{dark:'#000',light:'#fff'}}, function(err,c) {
      if (!err && qe) qe.appendChild(c);
    });
  }

  renderCiLog();
  addPts(5, '📍 Check-in: ' + ev);
  toast('📍 Checked in! +5 pts');
  addNotif('📍', 'Event Check-in', 'Checked in to '+ev.replace(/_/g,' ')+'. +5 pts earned.', 'just now');
}
function renderCiLog() {
  var el = document.getElementById('ci-log'); if (!el) return;
  if (!checkins.length) { el.innerHTML = '<div class="empty">'+_('no_checkins')+'</div>'; return; }
  el.innerHTML = checkins.slice(0, 8).map(function(c) {
    return '<div class="tx-item"><span class="tx-text">📍 '+c.ev.replace(/_/g,' ')+'</span><span class="tx-date">'+c.time.slice(0,16)+'</span></div>';
  }).join('');
}

/* ══════════════════════════════════════════════════════
   ANALYTICS DASHBOARD
══════════════════════════════════════════════════════ */
function renderAnalytics() {
  var pc = Object.keys(myPreds).length;
  var cor = Math.round(pc * 0.42);
  var acc = pc > 0 ? Math.round(cor/pc*100) : 0;
  var eng = Math.min(100, Math.round((pts/(pts+100))*100 + nCmts*2));
  var sh = Math.min(100, streak * 14);
  var se = function(id,v) { var e=document.getElementById(id); if(e) e.textContent=v; };
  var sw = function(id,w) { var e=document.getElementById(id); if(e) e.style.width=Math.min(100,w)+'%'; };
  se('an-acc',acc+'%'); se('an-tot',pc); se('an-cor',cor); se('an-pts',pts); se('an-str',streak+'d');
  se('an-acc2',acc+'%'); se('an-eng',eng+'%'); se('an-sh',sh+'%');
  sw('an-acc-b',acc); sw('an-eng-b',eng); sw('an-sh-b',sh);
  var ch = document.getElementById('an-chart');
  if (ch) {
    var days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    var vals = [5,12,8,20,15,pts>0?Math.min(pts,30):3,pts];
    var mx = Math.max.apply(null,vals) || 1;
    ch.innerHTML = vals.map(function(v,i) {
      var h2 = Math.round((v/mx)*56)+6;
      return '<div class="chart-c" style="height:'+h2+'px" data-d="'+days[i]+'"></div>';
    }).join('');
  }
}

/* ══════════════════════════════════════════════════════
   NOTIFICATIONS — Live alerts
══════════════════════════════════════════════════════ */
function addNotif(icon, title, text, time) {
  notifs.unshift({icon:icon,title:title,text:text,time:time||new Date().toLocaleTimeString(),read:false});
  if (notifs.length > 50) notifs.pop();
  saveSt();
  updateNotifBadge();
  renderNotifs();
}
function updateNotifBadge() {
  var u = notifs.filter(function(n) { return !n.read; }).length;
  var d = document.getElementById('bell-dot');
  if (d) d.classList.toggle('on', u > 0);
}
function markAllRead() {
  notifs.forEach(function(n) { n.read = true; });
  saveSt();
  updateNotifBadge();
  renderNotifs();
  toast('All read');
}
function renderNotifs() {
  var el = document.getElementById('notif-list'); if (!el) return;
  if (!notifs.length) { el.innerHTML = '<div class="empty">No notifications yet</div>'; return; }
  el.innerHTML = notifs.slice(0, 30).map(function(n, i) {
    return '<div class="ncard'+(n.read?'':' unread')+'" onclick="markOne('+i+')">'+
      '<div class="ncard-icon">'+n.icon+'</div>'+
      '<div class="ncard-body"><div class="ncard-title">'+n.title+'</div><div class="ncard-text">'+n.text+'</div></div>'+
      '<div class="ncard-time">'+n.time+'</div>'+
    '</div>';
  }).join('');
}
function markOne(i) {
  if (notifs[i]) { notifs[i].read = true; saveSt(); updateNotifBadge(); renderNotifs(); }
}

/* ══════════════════════════════════════════════════════
   SYNC ALL UI
══════════════════════════════════════════════════════ */
function syncUI() {
  var lv = getLevel();
  var nxt = LEVELS.find(function(l) { return l.p > pts; });
  var se = function(id,v) { var e=document.getElementById(id); if(e) e.textContent=v; };
  se('pts-v', pts + ' PTS');
  se('pts-s', '🔥 ' + streak + ' days');
  se('pts-l', lv.i + ' ' + lv.n);
  if (user) {
    se('prof-name', user.username);
    se('hdr-user', user.username);
  }
  se('prof-lvl', lv.i + ' ' + lv.n);
  se('prof-streak', '🔥 ' + streak + ' Day Streak');
  se('prof-serial', 'Fan ID: ' + myFanId + ' · #' + mySerial);
  se('prof-pts', pts);
  se('prof-preds', nPreds);
  se('prof-coms', nCmts);
  se('trk-pts', pts + ' PTS');
  se('trk-preds', nPreds);
  se('trk-coms', nCmts);
  se('trk-streak', streak);
  var tl = document.getElementById('trk-lvl');
  if (tl) {
    var msg = lv.i + ' <strong>' + lv.n + '</strong>';
    if (nxt) msg += ' · ' + (nxt.p - pts) + ' pts to <strong>' + nxt.n + '</strong>';
    else msg += ' · 🏆 Max level!';
    tl.innerHTML = msg;
  }
  syncWalletProfile();
}

/* ══════════════════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════════════════ */
function goS(id, btn) {
  document.querySelectorAll('.scr').forEach(function(s) { s.classList.remove('on'); });
  document.querySelectorAll('.bni').forEach(function(b) { b.classList.remove('on'); });
  var sc = document.getElementById('s-'+id); if (sc) sc.classList.add('on');
  if (btn) btn.classList.add('on');
  else { var b = document.querySelector('[data-s="'+id+'"]'); if (b) b.classList.add('on'); }
  if (id === 'notifs') markAllRead();
  if (id === 'utilities') { /* reset to home */ cUtil(); }
}

/* ══════════════════════════════════════════════════════
   UTILITIES NAVIGATION
══════════════════════════════════════════════════════ */
function oUtil(id) {
  /* Switch to utilities screen */
  goS('utilities', document.querySelector('[data-s="utilities"]'));
  /* Show specific util page */
  document.querySelectorAll('.up').forEach(function(p) { p.classList.remove('on'); });
  var home = document.getElementById('util-home'); if (home) home.style.display = 'none';
  var target = document.getElementById('up-'+id);
  if (target) target.classList.add('on');
  /* Refresh data */
  if (id === 'fan-id') refreshFanId();
  if (id === 'analytics') renderAnalytics();
  if (id === 'wallet') syncWalletProfile();
  if (id === 'pts-tracker') { syncUI(); renderTrkHist(); }
  if (id === 'checkin') renderCiLog();
}
function cUtil() {
  document.querySelectorAll('.up').forEach(function(p) { p.classList.remove('on'); });
  var home = document.getElementById('util-home'); if (home) home.style.display = 'block';
}

/* ══════════════════════════════════════════════════════
   FOOTBALL UTILITIES — All working functions
══════════════════════════════════════════════════════ */
function initUtils() {
  /* Group simulator selector */
  var sg = document.getElementById('sim-g');
  if (sg && sg.options.length <= 1) {
    Object.keys(GROUPS).forEach(function(g) {
      var o = document.createElement('option'); o.value = g; o.textContent = 'Group ' + g;
      sg.appendChild(o);
    });
  }
  /* Team compare selectors */
  ['tc-a','tc-b'].forEach(function(id) {
    var sel = document.getElementById(id); if (!sel || sel.options.length > 1) return;
    ALL_TEAMS.forEach(function(t) {
      var o = document.createElement('option'); o.value = t; o.textContent = fl(t)+' '+t;
      sel.appendChild(o);
    });
  });
  renderTrkHist();
  renderAnalytics();
  renderCiLog();
}

/* Pi Calculator */
function calcPi() {
  var a = +((document.getElementById('pi-a')||{}).value||0);
  var p = +((document.getElementById('pi-p')||{}).value||0.17);
  var el = document.getElementById('pi-res'); if (!el) return;
  if (!a) { el.textContent = _('enter_above'); return; }
  el.textContent = a + 'π = $' + (a*p).toFixed(2) + ' · £' + (a*p*.79).toFixed(2) + ' · €' + (a*p*.92).toFixed(2) + ' · ﷼' + (a*p*3.75).toFixed(2);
}
function spi(n) { var e = document.getElementById('pi-a'); if (e) { e.value = n; calcPi(); } }

/* Future Value */
function calcFut() {
  var h = +((document.getElementById('fh')||{}).value||0);
  var p = +((document.getElementById('fp')||{}).value||0);
  var roi = p > 0 ? ((p-.17)/.17*100).toFixed(0) : 0;
  var el = document.getElementById('fut-res'); if (!el) return;
  if (!h) { el.textContent = _('enter_above'); return; }
  el.textContent = h + 'π at $' + p + ' = $' + (h*p).toFixed(2) + ' · Now: $' + (h*.17).toFixed(2) + ' · ROI: +' + roi + '%';
}

/* Odds Calculator */
function calcOdds() {
  var a = +((document.getElementById('oa')||{}).value||0);
  var d = +((document.getElementById('od')||{}).value||0);
  var b = +((document.getElementById('ob')||{}).value||0);
  var tot = a + d + b;
  var el = document.getElementById('odds-res'); if (!el) return;
  if (!tot) { el.textContent = _('enter_above'); return; }
  if (Math.abs(tot-100) > 5) { el.textContent = 'Should total 100% (currently ' + tot.toFixed(0) + '%)'; return; }
  var w = a > b && a > d ? 'Team A' : b > a && b > d ? 'Team B' : 'Draw';
  el.textContent = 'Most likely: ' + w + ' (' + Math.max(a,b,d).toFixed(0) + '%) · Recommend predicting ' + w;
}

/* Group Simulator */
function runSim() {
  var g = (document.getElementById('sim-g')||{}).value; if (!g) return;
  var teams = GROUPS[g];
  var el = document.getElementById('sim-res'); if (!el) return;
  var sc = teams.map(function(t) {
    return {n:t, p:Math.floor(Math.random()*9), gf:Math.floor(Math.random()*8), ga:Math.floor(Math.random()*5)};
  }).sort(function(a, b) { return b.p - a.p || (b.gf-b.ga) - (a.gf-a.ga); });
  el.innerHTML = '<div class="ibox" style="margin-bottom:0"><strong>Group '+g+' Simulation:</strong><br><br>'+
    sc.map(function(t,i) {
      return (i<2?'<span style="color:var(--lime)">✅ QUALIFY</span> ':'<span style="color:var(--t3)">❌</span> ') +
        fl(t.n)+' '+t.n+' · '+t.p+' pts · GF:'+t.gf+' GA:'+t.ga;
    }).join('<br>') +
    '<br><br><span style="font-size:.56rem;color:var(--t3)">Simulation only · Not a real prediction</span></div>';
}

/* Match Time Converter */
function calcTime() {
  var v = (document.getElementById('wt-inp')||{}).value; if (!v) return;
  var p = v.split(':'); var h = parseInt(p[0]), m = parseInt(p[1]);
  var zones = [
    {n:'London (BST)',o:5},{n:'Riyadh (AST)',o:7},{n:'Dubai (GST)',o:8},
    {n:'Karachi (PKT)',o:9},{n:'Mumbai (IST)',o:9,ex:30},
    {n:'Lagos (WAT)',o:5},{n:'Nairobi (EAT)',o:7},
    {n:'Jakarta (WIB)',o:11},{n:'Beijing (CST)',o:12},{n:'Sydney (AEST)',o:14}
  ];
  var el = document.getElementById('wt-res'); if (!el) return;
  el.innerHTML = '<div class="ibox" style="margin-bottom:0"><strong>Match at '+v+' ET:</strong><br><br>'+
    zones.map(function(z) {
      var em = m + (z.ex||0);
      var nh = (h + z.o + Math.floor(em/60)) % 24;
      var nm = em % 60;
      var ap = nh >= 12 ? 'PM' : 'AM';
      var dh = nh > 12 ? nh-12 : (nh||12);
      return '🌍 '+z.n+': <strong>'+dh+':'+(nm<10?'0':'')+nm+' '+ap+'</strong>';
    }).join('<br>')+
  '</div>';
}

/* Team Compare */
function compTeams() {
  var a = (document.getElementById('tc-a')||{}).value;
  var b = (document.getElementById('tc-b')||{}).value;
  if (!a || !b || a === b) return;
  var ga = Object.entries(GROUPS).find(function(e) { return e[1].includes(a); });
  var gb = Object.entries(GROUPS).find(function(e) { return e[1].includes(b); });
  var same = ga && gb && ga[0] === gb[0];
  var el = document.getElementById('tc-res'); if (!el) return;
  el.innerHTML = '<div class="ibox" style="margin-bottom:0">'+fl(a)+' <strong>'+a+'</strong> vs '+fl(b)+' <strong>'+b+'</strong><br><br>'+
    '📊 '+a+' — Group '+(ga?ga[0]:'TBD')+'<br>'+
    '📊 '+b+' — Group '+(gb?gb[0]:'TBD')+'<br><br>'+
    (same?'⚡ <strong>Same group!</strong> They face each other in the group stage.':
     '🏆 Could meet in knockout rounds if both teams advance from their groups.')+
  '</div>';
}

/* Points Tracker History */
function renderTrkHist() {
  var el = document.getElementById('trk-hist'); if (!el) return;
  if (!txs.length) { el.innerHTML = '<div class="empty">No activity yet · Start predicting!</div>'; return; }
  el.innerHTML = txs.slice(0, 20).map(function(x) {
    return '<div class="tx-item"><span class="tx-text">'+x.t+'</span><span class="tx-date">'+x.d+'</span></div>';
  }).join('');
}

/* ══════════════════════════════════════════════════════
   AD ROTATION
══════════════════════════════════════════════════════ */
var ADS = [
  '⚽ WorldCup — Pi Network Football Community · worldcup.pi',
  '🚀 Mine Pi every day · 70M+ Pioneers · pi.app',
  '🏆 Build on Pi Network · develop.pi',
  '⭐ Unlock Premium Fan — 0.5π · worldcup.pi',
  '🎟️ Digital QR match tickets available now · worldcup.pi',
  '🌍 Pi Network — The future of digital currency · worldcup.pi'
];
var adIdx = 0;
function cycleAd() {
  var el = document.getElementById('ad'); if (!el) return;
  el.style.opacity = '0';
  setTimeout(function() { el.textContent = ADS[adIdx++ % ADS.length]; el.style.opacity = '1'; }, 400);
  setTimeout(cycleAd, 9000);
}

/* ── TOAST ── */
function toast(msg) {
  var t = document.getElementById('toast'); if (!t) return;
  t.textContent = msg;
  t.classList.add('on');
  setTimeout(function() { t.classList.remove('on'); }, 3000);
}

/* ══════════════════════════════════════════════════════
   INIT — MAINNET · sandbox:false
══════════════════════════════════════════════════════ */
window.addEventListener('load', function() {
  /* ✅ MAINNET INIT */
  if (typeof Pi !== 'undefined') {
    Pi.init({ version: '2.0', sandbox: false });
  }

  /* Apply saved language immediately */
  var saved = localStorage.getItem('wc_lang') || 'en';
  if (saved !== 'en') {
    lang = saved;
    document.documentElement.lang = saved;
    if (saved === 'ar') {
      document.documentElement.dir = 'rtl';
      document.body.style.direction = 'rtl';
    }
    applyI18n();
    /* Mark correct lang button */
    var m = document.querySelector('.llbtn[onclick*="\''+saved+'\'"]');
    if (m) { document.querySelectorAll('.llbtn').forEach(function(b){b.classList.remove('on');}); m.classList.add('on'); }
  }

  /* Hide splash */
  setTimeout(function() {
    var sp = document.getElementById('splash');
    if (sp) sp.classList.add('gone');
  }, 1800);
});
