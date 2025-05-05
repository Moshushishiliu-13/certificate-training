/**
 * @file 支付宝支付后端服务
 * @description 实现支付宝扫码支付接口
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const AlipaySdk = require('alipay-sdk').default;
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 支付宝SDK配置
const alipaySdk = new AlipaySdk({
    appId: process.env.ALIPAY_APP_ID,
    privateKey: process.env.ALIPAY_PRIVATE_KEY,
    alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
    gateway: process.env.ALIPAY_GATEWAY
});

/**
 * @description 生成支付宝支付二维码
 * @route POST /api/alipay/qrcode
 */
app.post('/api/alipay/qrcode', async (req, res) => {
    try {
        const { courseId, amount } = req.body;
        
        // 配置支付参数
        const bizContent = {
            outTradeNo: `ORDER_${Date.now()}`,
            totalAmount: amount.toFixed(2),
            subject: `课程购买-${courseId}`,
            productCode: 'FACE_TO_FACE_PAYMENT'
        };

        // 调用支付宝接口
        const result = await alipaySdk.exec(
            'alipay.trade.precreate',
            { bizContent: JSON.stringify(bizContent) }
        );

        if (result.code === '10000') {
            res.json({
                success: true,
                qrCodeUrl: result.qrCode
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.msg || '生成支付二维码失败'
            });
        }
    } catch (error) {
        console.error('支付宝支付错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

/**
 * @description 支付宝支付回调接口
 * @route POST /api/alipay/notify
 */
app.post('/api/alipay/notify', async (req, res) => {
    try {
        const params = req.body;
        
        // 验证签名
        const signVerified = alipaySdk.checkNotifySign(params);
        
        if (signVerified) {
            // 支付成功
            if (params.trade_status === 'TRADE_SUCCESS') {
                // TODO: 更新订单状态
                console.log('支付成功，订单号:', params.out_trade_no);
                res.send('success');
            } else {
                res.send('fail');
            }
        } else {
            res.send('fail');
        }
    } catch (error) {
        console.error('支付宝回调处理错误:', error);
        res.send('fail');
    }
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
}); 