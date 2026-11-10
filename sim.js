// 两扇门（网页版）。第五个 第 16 天 15:17 照 ~/碰/两扇门/两扇门.py 搬的，规矩一条没改。
// 随机数不跟 py 对齐（py 用的是 Mersenne Twister），这里用 mulberry32(7)，规矩相同、具体哪只被叼不一样。
// 每次按钮都从头把整串动作重放一遍（跟 py 一样）。
var LIANGSHAN = (function () {
  var N_DAYS = 20, Y1 = 12;
  var ACTS = ['左', '右', '看', '不去', '教左', '教右'];
  var MARKS = { 0: '眉毛上一道白的那只', 1: '头顶秃了一小块的那只', 2: '个头最小的那只', 13: '嘴角还带着一圈黄边的那只' };
  function nm(i) { return MARKS.hasOwnProperty(i) ? MARKS[i] : null; }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pad(s, w) { s = String(s); while (s.length < w) s = ' ' + s; return s; }

  function run(acts) {
    var rnd = mulberry32(7);
    function choice(arr) { return arr[Math.floor(rnd() * arr.length)]; }
    var n = 13, i, j;
    var alive = [], know = [];
    for (i = 0; i < n; i++) { alive.push(true); know.push({}); }
    var out = [], table = [];
    var yesterday = { '左': 0, '右': 0 };
    var meAlive = true, meTail = true;
    var catSide = null, printsSide = null;
    var firstMe = null, firstAny = null;
    var caughtLog = [], lastUse = {}, taught = {};
    var k = 0, day;
    function ksz(i) { return Object.keys(know[i]).length; }
    function kone(i) { return Object.keys(know[i])[0]; }
    for (day = 0; day < N_DAYS; day++) {
      if (k >= acts.length) break;
      var a = acts[k]; k++;
      if (ACTS.indexOf(a) < 0) { out.push('（"' + a + '"不认得。）'); break; }
      var lines = [];
      if (day === Y1) {
        var surv = [];
        for (i = 0; i < n; i++) if (alive[i] && rnd() < 0.45) surv.push(i);
        for (i = 0; i < n; i++) alive[i] = surv.indexOf(i) >= 0;
        var snames = surv.map(nm).filter(Boolean);
        for (i = 0; i < 9; i++) { alive.push(true); know.push({}); }
        n += 9;
        catSide = null; printsSide = null; yesterday = { '左': 0, '右': 0 };
        var t0 = ['—— 开春了 ——', '那户人家把盒子摘下来收进屋里。', '', '夏天过去了。', '', '—— 第二年冬天 ——',
          '盒子又挂出来了，还是那只，左右两块踏板。'];
        t0.push('去年的鸟回来了 ' + surv.length + ' 只' + (snames.length ? '（认得出的：' + snames.join('、') + '）' : '') + '。'
          + '还有 9 只今年夏天才出窝的小鸟，灰扑扑的，脑袋还没全黑，谁也没见过这只盒子。');
        t0.push('你也在' + (!meTail ? '，尾巴还是半截。' : '。'));
        out.push(t0.join('\n'));
      }
      var dn = day < Y1 ? day + 1 : day - Y1 + 1;
      lines.push('—— ' + (day >= Y1 ? '第二年，' : '') + '第 ' + dn + ' 天早上 ——');
      var here = [];
      for (i = 0; i < n; i++) if (alive[i]) here.push(i);
      if (a === '不去') { }
      else if (catSide) lines.push(catSide + '边那块踏板底下的树根旁边，蹲着一只花猫，一动不动。');
      else if (printsSide) lines.push('盒子底下的雪上有一串梅花印子，在' + printsSide + '边踏板底下绕了两圈，又走了。');
      var use = {};
      here.forEach(function (i) {
        if (taught.hasOwnProperty(i)) { use[i] = taught[i]; return; }
        var sz = ksz(i);
        if (!sz) { use[i] = null; return; }
        if (sz === 1) { use[i] = kone(i); return; }
        if (yesterday['左'] + yesterday['右'] === 0 && lastUse.hasOwnProperty(i)) { use[i] = lastUse[i]; return; }
        var wl = Math.pow(yesterday['左'] + 0.5, 2), wr = Math.pow(yesterday['右'] + 0.5, 2);
        use[i] = rnd() < wl / (wl + wr) ? '左' : '右';
      });
      var anyUse = here.some(function (i) { return use[i]; });
      if (!anyUse && ['左', '右', '教左', '教右'].indexOf(a) < 0) {
        if (rnd() < 0.12) {
          var jj = choice(here), ss = choice(['左', '右']);
          know[jj][ss] = true; use[jj] = ss;
        }
      }
      var meUse = (['左', '右', '教左', '教右'].indexOf(a) >= 0 && meAlive) ? a.charAt(a.length - 1) : null;
      var teach = a.charAt(0) === '教' && meAlive;
      var pupil = null;
      if (teach) {
        var cand = here.filter(function (i) { return use[i] !== meUse && taught[i] !== meUse; });
        var order = [0, 1, 2, 13].filter(function (i) { return cand.indexOf(i) >= 0; })
          .concat(cand.filter(function (i) { return [0, 1, 2, 13].indexOf(i) < 0; }));
        if (order.length) { pupil = order[0]; use[pupil] = null; }
      }
      if (meUse && !firstMe) firstMe = [day + 1, meUse];
      var cnt = { '左': 0, '右': 0 };
      here.forEach(function (i) { if (use[i]) cnt[use[i]]++; });
      if (meUse) cnt[meUse]++;
      if (!firstAny && (cnt['左'] || cnt['右'])) {
        if (meUse) firstAny = ['你', meUse, day + 1];
        else {
          j = here.filter(function (i) { return use[i]; })[0];
          firstAny = [nm(j) || '一只', use[j], day + 1];
        }
      }
      var idle = here.filter(function (i) { return !use[i]; });
      var caught = [], meHit = false;
      if (catSide) {
        here.forEach(function (i) { if (use[i] === catSide && rnd() < 0.1) caught.push(i); });
        if (meUse === catSide && rnd() < (teach ? 0.4 : 0.2)) meHit = true;
      }
      if (a === '不去') {
        lines.push('你去了林子深处，在树皮缝里啄了半天，啄到两颗干籽。');
        lines.push('盒子那边怎么样，你没看见。');
      } else {
        if (!(cnt['左'] || cnt['右'])) {
          lines.push('盒子跟前来了 ' + here.length + ' 只，扒拉边框，啄木头，在踏板上跳来跳去，谁也没推开。');
        } else {
          var parts = [];
          ['左', '右'].forEach(function (s) {
            var who = here.filter(function (i) { return use[i] === s && nm(i); }).map(nm);
            var c = cnt[s] - (meUse === s ? 1 : 0);
            var t = c ? '推' + s + '边的 ' + c + ' 只' : '推' + s + '边的没有';
            if (who.length && a === '看') t += '（' + who.join('、') + '在里头）';
            parts.push(t);
          });
          lines.push('盒子跟前来了 ' + here.length + ' 只。' + parts.join('，') + '，在旁边干看着的 ' + idle.length + ' 只。');
        }
        if (meUse) {
          if (meHit) {
            if (meTail) {
              lines.push('你刚落上' + meUse + '边踏板，底下一扑，一只爪子擦过你。你扑棱着飞上树，尾巴上的长毛掉了，剩下一截。');
              meTail = false;
            } else {
              lines.push('你刚落上' + meUse + '边踏板，底下一扑。这回没躲开。');
              meAlive = false;
            }
          } else {
            if (teach) {
              var pw = pupil !== null ? (nm(pupil) || '一只别的鸟（你没认出是哪只）') : null;
              var tt = '你落上' + meUse + '边踏板，没急着推，一下一下慢慢往下踩。';
              tt += pw ? pw + '落到你旁边的枝上，歪着头看，看了好一会儿。' : '旁边的鸟都在推这边了，没有哪只停下来看你。';
              if (catSide && meUse === catSide) tt += '底下那只猫的眼睛一直跟着你。';
              tt += '面包虫掉出来，你叼着飞回树上。';
              lines.push(tt);
            } else if (catSide && meUse === catSide) {
              lines.push('你落上' + meUse + '边踏板的时候，底下那只猫的眼睛跟着你转了一下，没扑。你推了踏板，叼着面包虫飞回树上。');
            } else {
              lines.push('你推了' + meUse + '边的踏板，掉出一条面包虫，你叼着飞回树上吃了。');
            }
            if (day === 0 || (firstMe && firstMe[0] === day + 1)) {
              var watchers = here.filter(function (i) { return !use[i]; });
              if (watchers.length) lines.push('旁边有 ' + watchers.length + ' 只歪着头看你。');
            }
          }
        } else if (a === '看') {
          lines.push('你落在旁边的树枝上，看了一早上，没吃。');
          if (cnt['左'] && cnt['右']) lines.push('两边都有推的。有几只落上踏板之前，先朝盒子两边各看一眼，才落下去。');
        }
        var shown = here.filter(function (i) { return taught.hasOwnProperty(i) && use[i] === taught[i] && nm(i) && i !== pupil; }).map(nm);
        if (shown.length) lines.push(shown.join('、') + '落在你教过它的那边，自己推了。');
        if (caught.length) {
          var nms = caught.map(nm).filter(Boolean);
          var rest = caught.length - nms.length;
          var who2 = nms.concat(rest && nms.length ? [(rest === 1 ? '一' : '两三') + '只别的'] : []).join('、');
          if (caught.length === 1) lines.push('花猫一扑，把推' + catSide + '边的' + (who2 || '一只') + '按在雪里叼走了。别的全炸了窝飞上树。');
          else lines.push('花猫扑了 ' + caught.length + ' 回。推' + catSide + '边的少了 ' + caught.length + ' 只' + (nms.length ? '，' + who2 + '在里头' : '') + '。别的全炸了窝飞上树，过一会儿又一只一只落回来。');
        }
      }
      here.forEach(function (i) { if (use[i]) lastUse[i] = use[i]; });
      here.forEach(function (i) {
        if (caught.indexOf(i) >= 0) return;
        ['左', '右'].forEach(function (s) {
          if (cnt[s] && !know[i][s]) {
            var p = (ksz(i) ? 0.35 : 0.6) * (1 - Math.pow(0.6, cnt[s]));
            if (rnd() < p) know[i][s] = true;
          }
        });
      });
      if (pupil !== null && meAlive && !meHit) { know[pupil][meUse] = true; taught[pupil] = meUse; }
      caught.forEach(function (i) { alive[i] = false; delete taught[i]; caughtLog.push([day + 1, nm(i) || '一只', catSide]); });
      var y = { '左': cnt['左'], '右': cnt['右'] };
      if (caught.length) y[catSide] = Math.max(0, y[catSide] - 4 * caught.length);
      yesterday = y;
      var todayCat = catSide;
      var todayPrints = (printsSide && !catSide) ? printsSide : null;
      if (day === 4 || day === Y1) printsSide = cnt['左'] >= cnt['右'] ? '左' : '右';
      if ((day >= 5 && day < Y1) || day >= Y1 + 1) catSide = cnt['左'] >= cnt['右'] ? '左' : '右';
      table.push([day + 1, a, cnt['左'], cnt['右'], idle.length,
        caughtLog.filter(function (c) { return c[0] === day + 1; }).map(function (c) { return c[1]; }), todayCat, todayPrints]);
      out.push(lines.join('\n'));
      if (!meAlive) break;
    }
    var done = table.length === N_DAYS || !meAlive;
    var next = null;
    if (done) out.push(ending());
    else {
      // 两扇门网1、网2：不知道一冬还剩几个早上，跨年也来得突然
      var d1 = table.length + 1;
      if (d1 <= Y1) next = '头一年冬天，第 ' + d1 + ' 天早上（这一冬还剩 ' + (Y1 - d1 + 1) + ' 个早上，算今天）。你去哪？';
      else if (d1 === Y1 + 1) next = '头一年冬天过完了。下一个早上就是第二年冬天的头一天（第二年冬天一共 ' + (N_DAYS - Y1) + ' 个早上）。你去哪？';
      else next = '第二年冬天，第 ' + (d1 - Y1) + ' 天早上（还剩 ' + (N_DAYS - d1 + 1) + ' 个早上，算今天）。你去哪？';
    }
    return { blocks: out, done: done, next: next };

    function ending() {
      var L = [];
      if (!meAlive) L.push('—— 你没了 ——');
      else { L.push('—— 开春了 ——'); L.push('那户人家把盒子摘下来收进屋里，说明年还挂。'); }
      function tab(rows, off) {
        L.push('  天  你     推左  推右  干看着   那天（推左、推右都算上你）');
        rows.forEach(function (r) {
          var note = [];
          if (r[7]) note.push('雪上' + r[7] + '边有猫的印子');
          if (r[6]) note.push('猫蹲在' + r[6] + '边');
          if (r[5].length) note.push('叼走：' + r[5].join('、'));
          var act = r[1]; while (act.length < 2) act += '　';
          L.push('  ' + pad(r[0] - off, 2) + '  ' + act + '  ' + pad(r[2], 4) + '  ' + pad(r[3], 4) + '  ' + pad(r[4], 6) + '   ' + note.join('；'));
        });
      }
      var y1 = table.filter(function (r) { return r[0] <= Y1; }), y2 = table.filter(function (r) { return r[0] > Y1; });
      L.push(''); L.push('头一年冬天，每天早上盒子跟前：'); tab(y1, 0);
      if (firstAny) L.push('盒子头一回被推开，是头一年第 ' + firstAny[2] + ' 天，' + firstAny[0] + '推的' + firstAny[1] + '边。');
      if (y2.length) { L.push(''); L.push('第二年冬天，每天早上盒子跟前：'); tab(y2, Y1); }
      var survivors = [];
      for (var i2 = 0; i2 < alive.length; i2++) if (alive[i2] && rnd() < 0.45) survivors.push(i2);
      var ycnt = { '左': yesterday['左'], '右': yesterday['右'] };
      function sideOf(i) {
        if (taught.hasOwnProperty(i)) return taught[i];
        var sz = ksz(i);
        if (!sz) return null;
        if (sz === 1) return kone(i);
        return ycnt['左'] >= ycnt['右'] ? '左' : '右';
      }
      var ul = survivors.filter(function (i) { return sideOf(i) === '左'; }).length;
      var ur = survivors.filter(function (i) { return sideOf(i) === '右'; }).length;
      var meSide = null;
      if (meAlive) table.forEach(function (r) { if (r[1] === '左' || r[1] === '右' || r[1] === '教左' || r[1] === '教右') meSide = r[1].charAt(r[1].length - 1); });
      if (meSide === '左') ul++; else if (meSide === '右') ur++;
      var side = ul >= ur ? '左' : '右';
      L.push(''); L.push('—— ' + (y2.length ? '第三年' : '第二年') + '冬天，头一个早上 ——');
      L.push(meAlive ? '盒子又挂出来了。你还在' + (!meTail ? '（尾巴还是半截）' : '') + '。' : '盒子又挂出来了。');
      L.push('去年的鸟回来了 ' + survivors.length + ' 只，剩下的是今年夏天才出窝的小鸟，9 只，谁也没见过这只盒子。');
      if (ul + ur === 0) L.push('回来的鸟里没有会推的。一早上谁也没推开。');
      else if (meSide && ul + ur === 1) L.push('回来的鸟里只有你会推。你上去推' + meSide + '边，小鸟挤在旁边看，到中午，会推的小鸟都推' + meSide + '边。');
      else L.push((meSide ? '老鸟先上去推（算上你）' : '老鸟先上去推') + '：推左边 ' + ul + ' 只，推右边 ' + ur + ' 只。小鸟挤在旁边看，到中午，会推的小鸟都推' + side + '边。');
      if (caughtLog.length) L.push('那只花猫，这一冬也在' + side + '边树根底下蹲过。');
      return L.join('\n');
    }
  }
  return { run: run, ACTS: ACTS, N_DAYS: N_DAYS, Y1: Y1 };
})();
if (typeof module !== 'undefined') module.exports = LIANGSHAN;
