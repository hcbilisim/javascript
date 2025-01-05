# EasyPost.js Kütüphanesi

EasyPost.js, form verilerini AJAX ile göndermek, form doğrulaması yapmak ve SweetAlert2 ile kullanıcıya geri bildirimler sunmak için kullanılan bir JavaScript kütüphanesidir.

## Özellikler

- Form verilerinin AJAX ile tek seferde gönderilmesi.
- Özelleştirilebilir doğrulama desenleri.
- SweetAlert2 ile zengin kullanıcı geri bildirimi.
- ASP.NET MVC projelerinde `Html.AntiForgeryToken()` desteği.
- XSS saldırıları  İçin HTML kaçış kontrolü

## Başlarken


Bu kütüphaneyi kullanmaya başlamadan önce, projenize jQuery ve SweetAlert2 kütüphanelerini dahil etmeniz gerekir.

Kütüphaneyi CDN olarak  <head></head> tagları arasında projenize dahil edin.
```html
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="https://cdn.jsdelivr.net/gh/hcbilisim/Javascript/EasyPost.min.js"></script>
```

# Kullanım

## 1. Form verilerinin gönderilmesi
Formunuzu ve `SendPost` fonksiyonunu aşağıdaki gibi kullanabilirsiniz:

```html
<form id="myForm">
    <!-- Form elemanlarınız -->
    <input type="hidden" name="__RequestVerificationToken" value="@AntiForgery.GetTokens().Token" />
    <input type="text" name="Name" id="Name" />
    <input type="number" name="Price" id="Price" />
    <button type="button" id="submitButton">Gönder</button>
</form>

<script>
    $(document).ready(function() {
        $('#submitButton').click(function() {
            SendPost('#myForm', '/api/endpoint', function(response) {
                /*
                    bu bölümde herhangi bir mesaj göstermenize gerek yoktur. Kütüphane başarılı işlemler için mesaj vermektedir.
                    sadece ekstra yapılacak işlemler için (örneğin: yönlendirme işlemi) kullanınız.
                */
            }, function(xhr, status, error) {
                /*
                    bu bölümde herhangi bir hata mesajı göstermenize gerek yoktur. Kütüphane hatalı işlemler için mesaj vermektedir.
                    sadece ekstra yapılacak işlemler için (örneğin: yönlendirme işlemi) kullanınız.
                */
            });
        });
    });
</script>
```
## 2. C# tarafında post verilerini işleme ve doğrulama 

Modelinizi hazırlayın. 

```csharp
using System.ComponentModel.DataAnnotations;

public class ProductModel
{
    [Required(ErrorMessage = "Ürün adı zorunludur.")]
    [StringLength(100, ErrorMessage = "Ürün adı 100 karakterden fazla olamaz.")]
    public string Name { get; set; }

    [Required(ErrorMessage = "Fiyat zorunludur.")]
    [Range(0.01, 10000, ErrorMessage = "Fiyat 0.01 ile 10000 arasında olmalıdır.")]
    public decimal Price { get; set; }
}

```

Form verilerinizi HttpPost ile yakalayın ve doğrulamayı sağlayın.
```csharp
[HttpPost]
[ValidateAntiForgeryToken]
public JsonResult Save(ProductModel model)
{
    if (ModelState.IsValid)
    {
        return Json(new { success = true, message = "Ürün başarıyla kaydedildi." });
    }
    else
    {
        return Json(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList() });
    }
}
```

## 3. Tablo İçerisinde Delete işleminin kullanımı

Silinecek kaydın ID'sini ve nesneyi gönderin.

```html
<button onclick="DeleteTableItemPost('/api/delete-item', 1, $(this).closest('tr'))">Sil</button>
```

## 4. Delete işleminin kullanımı

Silinecek kaydın ID'sini gönderin gönderin.

```html
<script>
    $(document).ready(function() {
        $('#deleteButton').click(function() {
            var id = 1;
            DeleteItemPost('/api/endpoint', id) {
                /*
                    bu bölümde herhangi bir mesaj göstermenize gerek yoktur. Kütüphane başarılı işlemler için mesaj vermektedir.
                    sadece ekstra yapılacak işlemler için (örneğin: yönlendirme işlemi) kullanınız.
                */
            }, function(xhr, status, error) {
                /*
                    bu bölümde herhangi bir hata mesajı göstermenize gerek yoktur. Kütüphane hatalı işlemler için mesaj vermektedir.
                    sadece ekstra yapılacak işlemler için (örneğin: yönlendirme işlemi) kullanınız.
                */
            });
        });
        </script>
    });
```

## Lisans
Bu proje MIT Lisansı altında lisanslanmıştır. Detaylı bilgi için [LICENSE](LICENSE) dosyasına göz atabilirsiniz.
