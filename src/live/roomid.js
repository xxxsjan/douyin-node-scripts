const roomIdData = [
  { live_id: "598854394497" },
  { live_id: "376266499665" },
  { live_id: "223627428375" },
  { live_id: "715450755360" },
  { live_id: "2644799702" },
  { live_id: "846208560421" },
  { live_id: "867209898521" },
  { live_id: "297441197735" },
  { live_id: "141090380718" },
  { live_id: "130554343541" },
  { live_id: "92656129200" },
  { live_id: "763309590401" },
  { live_id: "852931774174" },
  { live_id: "687657703335" },
  { live_id: "675251776530" },
  { live_id: "34189047183" },
  { live_id: "268260735980" },
  { live_id: "723807354278" },
  { live_id: "723360469794" },
  { live_id: "183296343904" },
  { live_id: "44271847487" },
  { live_id: "266834291270" },
  { live_id: "45781364744" },
  { live_id: "145171557063" },
  { live_id: "554990339115" },
  { live_id: "805445232697" },
  { live_id: "661097282048" },
  { live_id: "942310090656" },
  { live_id: "656209183079" },
  { live_id: "88550851627" },
  { live_id: "475958312113" },
  { live_id: "1604649889" },
  { live_id: "62306938508" },
  { live_id: "282484501867" },
  { live_id: "432273419375" },
  { live_id: "96447992986" },
  { live_id: "97603095560" },
  { live_id: "213023206381" },
  { live_id: "255788147255" },
  { live_id: "177583857094" },
  { live_id: "118388591366" },
  { live_id: "361154082414" },
  { live_id: "7100426547" },
  { live_id: "111706298201" },
  { live_id: "122334876775" },
  { live_id: "328785033754" },
  { live_id: "825114948601" },
  { live_id: "513787174575" },
  { live_id: "429747632009" },
  { live_id: "468203594456" },
  { live_id: "739447938547" },
  { live_id: "571871039128" },
  { live_id: "793825088216" },
  { live_id: "621130731921" },
  { live_id: "654537856407" },
  { live_id: "157723147465" },
  { live_id: "95629904758" },
  { live_id: "39282554264" },
  { live_id: "101205685611" },
  { live_id: "94466442391" },
  { live_id: "971964395921" },
  { live_id: "320026900302" },
  { live_id: "582703520574" },
  { live_id: "245726180707" },
  { live_id: "66128545839" },
  { live_id: "272958335838" },
  { live_id: "578566083284" },
  { live_id: "792118600515" },
  { live_id: "460141497395" },
  { live_id: "222565089056" },
  { live_id: "41156842016" },
  { live_id: "818530885571" },
  { live_id: "320590371209" },
  { live_id: "408303742247" },
  { live_id: "220522619778" },
  { live_id: "319061920853" },
  { live_id: "883606899835" },
  { live_id: "886435432618" },
  { live_id: "396990970639" },
  { live_id: "468590458852" },
  { live_id: "684091671764" },
  { live_id: "187681657253" },
  { live_id: "519742771581" },
  { live_id: "526975229471" },
  { live_id: "259286097217" },
  { live_id: "967138140254" },
  { live_id: "549463535079" },
  { live_id: "807270293670" },
  { live_id: "87269912537" },
  { live_id: "421513935149" },
  { live_id: "536247155569" },
  { live_id: "924412068306" },
  { live_id: "501792883506" },
  { live_id: "841117536567" },
  { live_id: "848328346337" },
  { live_id: "545530078628" },
  { live_id: "895447528613" },
  { live_id: "972013196965" },
  { live_id: "209454733858" },
  { live_id: "289344187419" },
  { live_id: "578165982354" },
  { live_id: "112227158195" },
];

function findDuplicateRoomIds(roomIdData) {
  let roomIds = {};
  let duplicates = [];

  roomIdData.forEach((item) => {
    const roomId = item.live_id;
    if (roomIds[roomId]) {
      if (roomIds[roomId] === 1) {
        duplicates.push(roomId);
      }
      roomIds[roomId]++;
    } else {
      roomIds[roomId] = 1;
    }
  });

  return duplicates;
}

console.log(
  "live_id 数量",
  roomIdData.length,
  "重复的roomid：",
  findDuplicateRoomIds(roomIdData)
);

const createUrl = () =>
  roomIdData.map((item) => ({
    ...item,
    url: `https://live.douyin.com/${item.live_id}?enter_from_merge=web_chat&enter_method=live_share&room_id=7363320154869992231`,
  }));

function shuffleArray(array) {
  const newArray = array.slice(); // 创建原数组的副本

  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }

  return newArray;
}
module.exports = {
  roomIdData: shuffleArray(createUrl()),
};
