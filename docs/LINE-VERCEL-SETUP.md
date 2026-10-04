# คู่มือตั้งค่า LINE OA บน Vercel สำหรับ BoomBox TH

คู่มือนี้ใช้สำหรับเปิดระบบส่งสรุปออเดอร์จากเว็บไซต์ BoomBox TH เข้า LINE Official Account ของร้านอัตโนมัติ

ระบบใช้ Environment Variables สองตัวนี้:

```env
LINE_CHANNEL_ACCESS_TOKEN=
LINE_DESTINATION_USER_ID=
```

> **สำคัญ:** ค่า `LINE_CHANNEL_ACCESS_TOKEN` เป็นความลับ ห้ามใส่ในโค้ดฝั่งหน้าเว็บ ห้าม commit ลง GitHub และห้ามส่งในแชทหรือภาพหน้าจอ

---

## ภาพรวมการทำงาน

```text
ลูกค้ากด “ยืนยันและส่งเข้า LINE OA”
        ↓
เว็บไซต์ส่งข้อมูลไปยัง server ของ BoomBox TH
        ↓
server เรียก LINE Messaging API ด้วย Channel Access Token
        ↓
LINE OA ส่งข้อความสรุปออเดอร์ไปยัง Destination ID ของร้าน
```

ข้อความที่ส่งจะมี:

- เลขออเดอร์
- วันและเวลา
- รายการสินค้าและจำนวน
- สีเครื่อง / กลิ่นที่เลือก
- ของแถม
- ยอดสินค้า
- ส่วนลด
- ยอดสุทธิ
- โปรโมชั่นและหมายเหตุ

---

## 1. สร้างหรือเปิด LINE Messaging API Channel

1. เข้า [LINE Developers Console](https://developers.line.biz/console/)
2. Login ด้วยบัญชีที่เป็นเจ้าของ LINE Official Account ของร้าน
3. เลือก **Provider** ของร้าน
4. เลือก Messaging API Channel ที่เชื่อมกับ LINE OA
   - ถ้ายังไม่มี ให้สร้าง Provider และ Channel ใหม่
   - เลือกประเภท **Messaging API**
5. ตรวจสอบว่า Channel นี้เป็นบัญชี LINE OA ที่ต้องการรับออเดอร์

> อย่าสร้าง Channel ใหม่โดยไม่จำเป็น เพราะอาจทำให้เชื่อมกับ LINE OA คนละบัญชี

---

## 2. สร้าง `LINE_CHANNEL_ACCESS_TOKEN`

1. ในหน้า Channel ให้เปิดแท็บ **Messaging API**
2. เลื่อนหาเมนู **Channel access token**
3. กด **Issue** หรือ **Issue channel access token**
4. ถ้ามีตัวเลือกอายุ Token ให้ใช้แบบ **Long-lived**
5. กดคัดลอก Token เก็บไว้ชั่วคราวใน Password Manager หรือไฟล์ส่วนตัวที่ไม่อยู่ใน Git

ตัวอย่างรูปแบบค่า:

```text
LINE_CHANNEL_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiIs...
```

> ไม่ต้องใส่เครื่องหมายคำพูด (`"`) และไม่ต้องใส่คำว่า `Bearer` หน้าค่า Token เพราะระบบจะเติม `Bearer` ให้เอง

### ถ้า Token เคยถูกเปิดเผย

ให้กลับไปที่หน้า Messaging API แล้วออก Token ใหม่ทันที จากนั้นอัปเดตค่าใหม่บน Vercel และ Redeploy

---

## 3. หา `LINE_DESTINATION_USER_ID`

ค่า Destination ID คือ ID ของผู้ใช้หรือห้องที่ต้องการให้ LINE OA ส่งออเดอร์ไปหา

สำหรับระบบนี้ แนะนำให้ใช้ **User ID ของบัญชีเจ้าของร้าน** ที่เพิ่ม LINE OA เป็นเพื่อนแล้ว

### วิธี A: ใช้รายชื่อ Followers API

วิธีนี้เหมาะเมื่อบัญชี LINE OA มีสิทธิ์เรียก Followers API

1. ให้บัญชีปลายทางแอด LINE OA เป็นเพื่อนก่อน
2. เตรียม Channel Access Token จากขั้นตอนที่ 2
3. รันคำสั่งนี้ในเครื่องของคุณ โดยแทน `YOUR_TOKEN` ด้วย Token จริง

```bash
curl -s https://api.line.me/v2/bot/followers/ids \
  -H "Authorization: Bearer YOUR_TOKEN"
```

ผลลัพธ์จะเป็น JSON ลักษณะนี้:

```json
{
  "userIds": [
    "Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "Uyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"
  ],
  "next": "..."
}
```

ค่าใน `userIds` คือค่าที่สามารถนำไปใช้เป็น `LINE_DESTINATION_USER_ID` ได้

ถ้ามีหลาย User ID ให้เลือก ID ของบัญชีที่ร้านต้องการรับออเดอร์

> บัญชีหรือแพ็กเกจ LINE OA บางประเภทอาจมีข้อจำกัดในการเรียกรายชื่อ Followers API ถ้าคำสั่งนี้ตอบกลับเป็น 403 หรือไม่มีสิทธิ์ ให้ใช้วิธี B หรือสอบถามผู้ดูแล LINE OA

### วิธี B: ใช้ User ID จาก Webhook Event

LINE จะส่ง `source.userId` มาใน Webhook Event เมื่อผู้ใช้ส่งข้อความหรือเพิ่มเพื่อนกับ LINE OA

ในข้อมูล Webhook จะมีรูปแบบคล้ายนี้:

```json
{
  "source": {
    "type": "user",
    "userId": "Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  }
}
```

ให้คัดลอกค่า `userId` ที่ขึ้นต้นด้วย `U` มาใช้เป็น `LINE_DESTINATION_USER_ID`

ข้อควรตรวจสอบ:

- ต้องเป็น User ID ของผู้รับที่ต้องการจริง
- ผู้รับต้องเพิ่ม LINE OA เป็นเพื่อน หรือเคยมีสิทธิ์รับข้อความจาก OA
- ระบบปัจจุบันใช้ Push Message ไปยัง ID โดยตรง ไม่ได้ส่งไปยังแชทของลูกค้าอัตโนมัติ

### Destination ID ใช้กับกลุ่มได้หรือไม่

LINE Messaging API รองรับปลายทางประเภทอื่น เช่น Group ID หรือ Room ID ในบางกรณี แต่ค่า Environment Variable ของโปรเจกต์ตั้งชื่อว่า `LINE_DESTINATION_USER_ID` เพื่อให้เข้าใจง่าย

ถ้าจะส่งเข้า Group ให้ใช้ Group ID ที่ LINE API ส่งมาใน Webhook แทน User ID และตรวจสอบให้ Bot อยู่ในกลุ่มนั้นแล้ว

---

## 4. เพิ่ม Environment Variables บน Vercel

1. เข้า [Vercel Dashboard](https://vercel.com/dashboard)
2. เลือก Project ของ BoomBox TH
3. เปิดเมนู **Settings**
4. เลือก **Environment Variables**
5. เพิ่มตัวแปรแรก:

| Name | Value | Environment |
|---|---|---|
| `LINE_CHANNEL_ACCESS_TOKEN` | Token จาก LINE Developers | Production |

6. เพิ่มตัวแปรที่สอง:

| Name | Value | Environment |
|---|---|---|
| `LINE_DESTINATION_USER_ID` | User ID ที่ขึ้นต้นด้วย `U` | Production |

7. กด **Save** หลังเพิ่มแต่ละตัวแปร

### ตัวอย่างค่าที่ถูกต้อง

```env
LINE_CHANNEL_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiIs...
LINE_DESTINATION_USER_ID=U1234567890abcdefghijklmnopqrstuvwxyz
```

### สิ่งที่ไม่ควรทำ

```env
# ไม่ควรใส่เครื่องหมายคำพูดโดยไม่จำเป็น
LINE_CHANNEL_ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIs..."

# ไม่ต้องใส่ Bearer
LINE_CHANNEL_ACCESS_TOKEN=Bearer eyJhbGciOiJIUzI1NiIs...

# ห้ามใส่ค่าใน client-side หรือไฟล์ที่ commit ขึ้น GitHub
```

> สำหรับการใช้งานจริงให้เลือก **Production** หากลูกค้าใช้งานจากโดเมน `boombox-th-v1-line.vercel.app` หากต้องการทดสอบ Preview ด้วย ให้เพิ่มตัวแปรใน Environment = **Preview** แยกด้วย

---

## 5. Redeploy หลังตั้งค่า

Vercel จะใช้ Environment Variables กับ Deployment ใหม่ ดังนั้นหลังบันทึกค่าแล้วต้อง Deploy ใหม่

วิธี Redeploy:

1. เปิดเมนู **Deployments** ใน Project
2. เลือก Deployment ล่าสุด
3. กดเมนู `...`
4. เลือก **Redeploy**
5. รอจนสถานะเป็น **Ready**
6. เปิดเว็บไซต์ใหม่อีกครั้ง

ถ้าเป็นการเปลี่ยน Token ที่ถูกเปิดเผย ควรสร้าง Token ใหม่ก่อน แล้วค่อย Redeploy

---

## 6. ทดสอบระบบส่งออเดอร์

1. เปิดเว็บไซต์ BoomBox TH
2. เพิ่มสินค้าอย่างน้อย 1 รายการลงตะกร้า
3. เลือกสีหรือกลิ่น ถ้าสินค้านั้นมีตัวเลือก
4. เปิดตะกร้าและตรวจสอบยอด
5. กด **ตรวจสอบและส่งเข้า LINE OA**
6. ตรวจรายการสินค้า ยอดสุทธิ และหมายเหตุ
7. กด **ยืนยันและส่งเข้า LINE OA**
8. ตรวจในแชท LINE OA หรือบัญชีปลายทาง

ข้อความที่สำเร็จควรมีลักษณะคล้าย:

```text
🛍️ ออเดอร์ใหม่ BB-20261004-ABC123
เวลา: 4/10/2569 23:45:00

รายการสินค้า
• แพ็ก A: ลองเล่น x1 = ฿299

ยอดสินค้า: ฿299
ยอดสุทธิ: ฿299

สถานะ: รอติดต่อยืนยันออเดอร์กับลูกค้า
```

---

## 7. แก้ปัญหาที่พบบ่อย

### ข้อความ: ร้านยังไม่ได้ตั้งค่า LINE OA สำหรับรับออเดอร์อัตโนมัติ

สาเหตุที่เป็นไปได้:

- ยังไม่ได้เพิ่มตัวแปรบน Vercel
- สะกดชื่อไม่ตรง ต้องใช้ตัวพิมพ์ใหญ่ตามนี้:
  - `LINE_CHANNEL_ACCESS_TOKEN`
  - `LINE_DESTINATION_USER_ID`
- เพิ่มตัวแปรไว้ใน Preview แต่กำลังเปิด Production
- เพิ่มค่าแล้วแต่ยังไม่ได้ Redeploy
- ค่าเป็นช่องว่างหรือมีการคัดลอกบรรทัดเกินมา

### ข้อความ: ส่งออเดอร์เข้า LINE OA ไม่สำเร็จ

ตรวจสอบตามลำดับ:

1. Token ยังไม่หมดอายุหรือถูก Revoke
2. Token มาจาก Channel เดียวกับ LINE OA ที่ต้องการรับออเดอร์
3. Destination ID ถูกต้องและไม่มีช่องว่าง
4. บัญชีปลายทางเพิ่ม LINE OA เป็นเพื่อนแล้ว
5. Bot ยังเปิดใช้งาน Messaging API อยู่
6. Vercel Deployment เป็นสถานะ **Ready**
7. ตรวจ Vercel Runtime Logs เพื่อดู HTTP status จาก LINE API

### ได้ HTTP 401

โดยทั่วไปหมายถึง Token ไม่ถูกต้อง หมดอายุ หรือถูกยกเลิก ให้ Issue Token ใหม่ แล้วอัปเดตบน Vercel

### ได้ HTTP 400

โดยทั่วไปหมายถึง Destination ID ไม่ถูกต้อง รูปแบบ JSON ไม่ผ่าน หรือปลายทางไม่สามารถรับข้อความได้ ให้ตรวจ User ID และลองส่งไปยังผู้ใช้ที่เพิ่ม OA เป็นเพื่อนแล้ว

### ได้ HTTP 403

โดยทั่วไปหมายถึง Channel ไม่มีสิทธิ์ หรือ Token ไม่มีสิทธิ์เรียก API ที่ต้องการ ให้ตรวจ Channel และ Token ใน LINE Developers Console

---

## 8. เช็กลิสต์ก่อนเปิดใช้งานจริง

- [ ] ใช้ Channel ของ LINE OA ร้านถูกบัญชี
- [ ] ออก Long-lived Channel Access Token แล้ว
- [ ] ได้ Destination User ID ที่ถูกต้อง
- [ ] ผู้รับเพิ่ม LINE OA เป็นเพื่อนแล้ว
- [ ] ตั้งค่า Environment Variables ใน Vercel Production แล้ว
- [ ] กด Redeploy หลังบันทึกค่า
- [ ] ทดสอบส่งออเดอร์สำเร็จอย่างน้อย 1 ครั้ง
- [ ] ตรวจว่าในข้อความมีรายการสินค้าและยอดสุทธิครบ
- [ ] ไม่มี Token อยู่ใน GitHub, client code, screenshot หรือแชท
- [ ] หาก Token รั่ว ให้ Revoke/Issue ใหม่ทันที

---

## ไฟล์ที่เกี่ยวข้องในโปรเจกต์

- `.env.example` — รายชื่อตัวแปรที่ต้องตั้งค่า
- `server/lineOrder.ts` — โมดูลเรียก LINE Messaging API
- `server/routers.ts` — Endpoint `orders.submit` สำหรับรับออเดอร์

โปรเจกต์จะอ่านค่าจาก Environment Variables ฝั่ง Server เท่านั้น จึงไม่ควรใช้ชื่อแบบ `VITE_...` หรือเปิดเผยค่า Token ในฝั่ง Client
