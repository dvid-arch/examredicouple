async function run() {
  const r = await fetch('https://www.youtube.com/@examredi/shorts');
  const t = await r.text();
  const match = t.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
  console.log(match ? match[1] : 'not found');
}
run();
