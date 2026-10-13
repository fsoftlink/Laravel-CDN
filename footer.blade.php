<script>
    // both are working
    $(document).on('click', '.data-btn', async function(e) {
        e.preventDefault();
        const btn = $(this);
        const rawData = btn.data('api') || {};

        let obj = {};
        if(!rawData) {
            goMsg({ status: 'info', msg: 'No data-api attribute found on button' }); 
            console.error('No data-api attribute found on button inside cdn_foot.blade.php');
            return;
        }

        try {
            if (typeof rawData === 'object') {
                obj = rawData;
            }else if ((rawData.startsWith('{') && rawData.endsWith('}')) || (rawData.startsWith('[') && rawData.endsWith(']'))) {
                obj = JSON.parse(rawData);
            } else {
                obj = JSON.parse(atob(rawData));
            }
            //console.log(data);
        } catch (e) {
            console.error('Invalid Base64 JSON', e);
            return;
        }
        
        const callback = btn.data('callback') || obj.callback || 'na'; // json obj
        const funName = btn.data('func') || obj.func || 'na'; // json obj

        console.log('data-btn clicked:', obj, 'callback:', callback, 'func:', funName); //success tested

        if (funName !== 'na' && typeof window[funName] === 'function') {
            await window[funName](obj);
        } else if (funName == 'na') {
            //alert(`Invalid data-fun: ${funName}. Please correct.`);
            goMsg({status: 'info',  msg: 'Invalid Func Name in data btn'})
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
    import { initFCM } from '{{ asset('pwa/fcm-init.js') }}';
    //$('#btnEnableNotification').on('click', async function() {      await requestNotificationPermission(true);    });
    
    setTimeout(async () => {
        await initFCM();
    }, 3000);
</script>
{{-- <div class="text-center mt-3 "> --}}
{{-- <button id="btnEnableNotification"   class="btn btn-success"> Enable Notifications </button> --}}
{{-- </div> --}}
