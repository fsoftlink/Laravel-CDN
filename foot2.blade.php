<script>
    // both are working
    $(document).on('click', '.data-btn', function(e) {
        e.preventDefault();
        const btn = $(this);
        const encoded = btn.data('api') || '';
        let data = {};
        try {
            data = JSON.parse(atob(encoded));
            //console.log(data);
        } catch (e) {
            console.error('Invalid Base64 JSON', e);
            return;
        }
        const callback = btn.data('callback') || data.callback || 'na'; // json data
        const funName = btn.data('func') || data.func || 'na'; // json data


        if (funName !== 'na' && typeof window[funName] === 'function') {
            window[funName](data);
        } else if (funName == 'na') {
            //alert(`Invalid data-fun: ${funName}. Please correct.`);
            goMsg({
                status: 'info',
                msg: 'Invalid Func Name in data btn'
            })
        }

        //if (callback == 'na') {    onConsole({'msg': 'no data on button'});   return;   }
    });

    /*$(document).on('click', '.data-btn', function (e) {
        e.preventDefault();
        const data = JSON.parse($(this).attr('data-api'));  // json data
        //console.log(data);   console.log(data.pk);   console.log(data.pkv);  console.log(data.task);
    });*/

    document.addEventListener('click', function(e) {
        const heart = e.target.closest('.wishlist-heart');

        if (!heart) {
            return;
        }

        const normalHeart = "{{ asset('front-assets/img/icon/heart.png') }}";
        const filledHeart = "{{ asset('front-assets/img/icon/heart-filled.png') }}";

        heart.src = heart.src.includes('heart.png') ? filledHeart : normalHeart;
    });
</script>
{{-- <script src="{{ asset('cdn/dsModal-1.0.0.js') }}"></script> --}}

<script type="module">
    //import { initFCM } from {{ asset('pwa/fcm-init.js') }};
    //$('#btnEnableNotification').on('click', async function() {      await requestNotificationPermission(true);    });
    
    import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
    import { getInstallations,  getId} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-installations.js';
    import { getMessaging, register,  onRegistered, onUnregistered, onMessage } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging.js';

    const firebaseConfig = {
        apiKey: "AIzaSyAvdDlLbNR4wnejZdc2V-bb0zA5xyCk3-Q",
        authDomain: "pwa240926.firebaseapp.com",
        projectId: "pwa240926",
        storageBucket: "pwa240926.firebasestorage.app",
        messagingSenderId: "134556607504",
        appId: "1:134556607504:web:b3b9b9636e64872287d695",
        measurementId: "G-08XT9D3QDP"
    };

    const app = initializeApp(firebaseConfig);
    const messaging = getMessaging(app);
    const installations = getInstallations(app);
    const BASE_PATH = `/${window.location.pathname.split('/')[1]}`;

    // Notify your backend to save this FID 
    onRegistered(messaging, async (fid) => {
        console.log('FID registered:', fid);
        if (fid) {
            const savedToken = localStorage.getItem('fid');
            let local = savedToken !== fid ? 'no' : 'yes';
            await postFcmData({token: fid, device_type: 'web', task: 'save_token', local_storage: local });
            localStorage.setItem('fid', fid);
        }
    });

    // Notify your backend to remove this FID , it no longer exist
    onUnregistered(messaging, async (fid) => {
        console.log('FID unregistered:', fid);
        await postFcmData({
            fid: fid,
            task: 'remove_fid'
        });
        localStorage.removeItem('fid');
    });



    export async function initFCM() {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('Permission granted');

                //const projectFolder = window.location.pathname.split('/')[1];
                //const swUrl = `${window.location.origin}/${projectFolder}/pwa/firebase-messaging-sw.js`;
                //const swUrl = `${BASE_PATH}/pwa/firebase-messaging-sw.js`;
                const swUrl = '{{ asset("pwa/firebase-messaging-sw.js") }}'; // for laravel
                const swRegistration = await navigator.serviceWorker.register(swUrl, { type: 'module'});
                console.log('Service Worker registered:', swRegistration);

                await register(messaging, {
                    vapidKey: 'BJwFk__7Gf7pjIjiAVBitJSe6SKpcDm2miOmagujqAFyiHC5Nd-S2dHRunQ-SHYBhVdobEJ_xgnG64H1SzOJ9Ng',
                    serviceWorkerRegistration: swRegistration
                });
            } else {
                console.error('Notification permission denied.');
            }
        } catch (err) {
            console.error('Error in initFCM:', err);
        }
    }

    onMessage(messaging, async (payload) => {
        console.log('Foreground Message received fcm-init : ', payload);
        const { title = 'Notification',  body = 'Notification Body', icon } = payload.notification || {};
        
        new Notification(title, { body: body, icon: icon || 'pwa/icons/icon-192x192.png' });

        // ✅ ab await chalega
        await postFcmData({ ...payload, task: 'deliverd_token' });
    });

    async function postFcmData(payload) {
        try {
            const addPayload = { type: 'web', action: 'appToken',  version: '2.0', domain: 'sks',  latitude: 'off', longitude: 'off', device: 'web' };
            console.log('FCM token saved:');
           /* const response = await fetch(`${BASE_PATH}/pwa/api/save-token.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({
                    ...payload,
                    ...addPayload
                })
            });
            const data = await response.json();
            if (data.status) {
                console.log('FCM token saved:', data.message);
            } else {
                console.error('FCM token error:', data.message);
            }*/
        } catch (error) {
            console.error('API Error postFcmData:', error);
        }
    }
    setTimeout(async () => {
        await initFCM();
    }, 3000);
</script>
{{-- <div class="text-center mt-3 "> --}}
{{-- <button id="btnEnableNotification"   class="btn btn-success"> Enable Notifications </button> --}}
{{-- </div> --}}

