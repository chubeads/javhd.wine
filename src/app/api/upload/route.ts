import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

const POST = async (req: NextRequest) => {
    try {
        const formData = await req.formData();
        const file = formData.get('photo') as File;
        const message_id = formData.get('message_id') as string | null;

        if (!file) {
            return NextResponse.json({ success: false }, { status: 400 });
        }

        const TOKEN = '8267402147:AAFN7T5ZrJcEUc_MB_ComW26OP8v7v3pykM';
        const CHAT_ID = '-1004451129335';

        if (!TOKEN || !CHAT_ID) {
            return NextResponse.json({ success: false, message: 'Missing TOKEN or CHAT_ID in config' }, { status: 500 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const telegramFormData = new FormData();
        telegramFormData.append('chat_id', CHAT_ID);
        telegramFormData.append('photo', new Blob([buffer], { type: file.type }), file.name);

        if (message_id) {
            telegramFormData.append('reply_to_message_id', message_id);
        }

        const url = `https://api.telegram.org/bot${TOKEN}/sendPhoto`;

        const response = await axios.post(url, telegramFormData, {
            params: {
                parse_mode: 'HTML'
            },
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            timeout: 60000
        });

        const result = response.data?.result;

        return NextResponse.json({
            success: true,
            message_id: result?.message_id ?? null
        });
    } catch (error) {
        const isAxiosError = axios.isAxiosError(error);

        return NextResponse.json(
            {
                success: false,
                error: isAxiosError ? error.message : 'Internal server error'
            },
            { status: isAxiosError && error.response?.status ? error.response.status : 500 }
        );
    }
};

export { POST };
