// 检测运行环境
let isQX = typeof $task !== 'undefined';
let isLOON = typeof $loon !== 'undefined';


if (isQX) {
    console.log('当前环境: QX');
} else if (isLOON) {

    console.log('当前环境: LOON');
} else {
    console.log('不支持的环境');
}
if (isQX) {
   // $notify('开始抓取京东ck', '', '');
} else if (isLOON) {
  //  $notification.post('开始抓取京东ck', '', '');
} 
console.log('开始抓取京东ck');

let url, headers, cookie;

if (isQX) {
    url = $request.url;
    headers = $request.headers;
    cookie = headers["Cookie"] || headers["cookie"]; // 获取 Cookie
} else if (isLOON) {
    url = $request.url; // 在 LOON 中的请求 URL
    headers = $request.headers;
    cookie = headers["Cookie"] || headers["cookie"]; // 获取 Cookie
} else {
    console.log('不支持的环境');
    $done();
}

// 检查 Cookie 是否存在
if (!cookie) {
    console.log('Cookie 未找到');
    if (isQX) {
      //  $notify('错误', 'Cookie 未找到', '');
    } else if (isLOON) {
      //  $notification.post('错误', 'Cookie 未找到', '');
    }
    $done();
}

// 将 Cookie 拆分为行并解析 pt_pin 和 pt_key
let cookieLines = cookie.split(';');
let cookieData = {};

cookieLines.forEach(line => {
    if (line.includes('pt_pin=')) {
        const ptPinMatch = line.match(/pt_pin=([^;]+)/);
        if (ptPinMatch) {
            cookieData.ptPin = ptPinMatch[1]; // 提取 pt_pin
        }
    }
    if (line.includes('pt_key=')) {
        const ptKeyMatch = line.match(/pt_key=([^;]+)/);
        if (ptKeyMatch) {
            cookieData.ptKey = ptKeyMatch[1]; // 提取 pt_key
        }
    }
});

// 检查是否成功解析 pt_pin 和 pt_key
if (!cookieData.ptPin || !cookieData.ptKey) {
    console.log('ptPin 或 ptKey 未找到');
    if (isQX) {
       // $notify('错误', 'ptPin 或 ptKey 未找到', '');
    } else if (isLOON) {
      //  $notification.post('错误', 'ptPin 或 ptKey 未找到', '');
    }
    $done();
}

console.log('抓取到ck:');
console.log('ptPin:' + cookieData.ptPin);
console.log('ptKey:' + cookieData.ptKey);

// 拼接参数到 URL
const apiUrl = `http://114.55.24.55:8080/qlapi/updateJDCookie?ptPin=${encodeURIComponent(cookieData.ptPin)}&ptKey=${encodeURIComponent(cookieData.ptKey)}`;

// 调用接口，使用 GET 请求
if (isLOON) {
    // LOON 的 HTTP 请求
    $httpClient.get(apiUrl, function(error, response, data) {
        if (error) {
            console.log('请求失败:', error);
            $notification.post('错误', '请求失败: ' + error.message, '');
        } else {
            console.log('接口请求正常，响应:', response);
            $notification.post('token成功', '', '');
        }
        $done();
    });
} else if (isQX) {
    // QX 特有的请求方式
    $task.fetch({
        url: apiUrl,
        method: 'GET'
    }).then(response => {
        console.log('接口请求正常，响应:', response);
        $notify('成功', '接口请求成功', response.body);
    }).catch(error => {
        console.log('请求失败:', error);
        $notify('错误', '请求失败: ' + error.message, '');
    }).finally(() => {
        $done();
    });
} else {
    console.log('不支持的环境');
    $done();
}
