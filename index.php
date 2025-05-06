<?php
/**
 * @description Check user's IP location and redirect if not in China
 */
function isChineseIP() {
    $ip = $_SERVER['REMOTE_ADDR'];
    $api_url = "http://ip-api.com/json/" . $ip;
    
    $response = @file_get_contents($api_url);
    if ($response) {
        $data = json_decode($response, true);
        return ($data && isset($data['countryCode']) && $data['countryCode'] === 'CN');
    }
    return true; // 如果检测失败，默认返回中文版
}

if (!isChineseIP()) {
    header('Location: index-en.html');
    exit();
}
?>
<!DOCTYPE html>
// ... 原有的 index.html 内容 ... 