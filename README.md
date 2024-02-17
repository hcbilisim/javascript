# AjaxPostLib.js Kütüphanesi

AjaxPostLib.js, form verilerini AJAX ile göndermek, form doğrulaması yapmak ve SweetAlert2 ile kullanıcıya geri bildirimler sunmak için kullanılan bir JavaScript kütüphanesidir.

## Özellikler

- Form verilerinin AJAX ile gönderilmesi.
- E-posta, telefon numarası, sayı ve tarih alanları için doğrulama.
- Özelleştirilebilir doğrulama desenleri.
- SweetAlert2 ile zengin kullanıcı geri bildirimi.
- ASP.NET MVC projelerinde `Html.AntiForgeryToken()` desteği.

## Başlarken

Bu kütüphaneyi kullanmaya başlamadan önce, projenize jQuery ve SweetAlert2 kütüphanelerini dahil etmeniz gerekir.

```html
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
```


Ardından, AjaxPostLib.js kütüphanesini indirerek projenize dahil edin.

```html
<script src="AjaxPostLib.js"></script> <!-- Kütüphanenizin yerel yolu -->
```

ya da CDN olarak projenize dahil edin.
```html
<script src="https://cdn.jsdelivr.net/gh/hcbilisim/AjaxPostLib/AjaxPostLib.js"></script>

```

## Kullanım
Formunuzu ve `SendPost` fonksiyonunu aşağıdaki gibi kullanabilirsiniz:

```html
<form id="myForm">
    <!-- Form elemanlarınız -->
    <button type="button" id="submitButton">Gönder</button>
</form>

<script>
    $(document).ready(function() {
        $('#submitButton').click(function() {
            SendPost('#myForm', '/api/endpoint', function(response) {
                // Başarılı gönderim geri bildirimi
            }, function(xhr, status, error) {
                // Hata geri bildirimi
            });
        });
    });
</script>

```

Form elemanlarınıza 'label' ve 'pattern' gibi özel attributeler ekleyerek, doğrulama mesajlarını ve desenlerini özelleştirebilirsiniz.

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır. Detaylı bilgi için [LICENSE](LICENSE) dosyasına göz atabilirsiniz.
