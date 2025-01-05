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
<form id="productForm">
    <input type="hidden" name="__RequestVerificationToken" value="@AntiForgeryTokenValue" />
    <input type="text" name="Name" />
    <input type="number" name="Price" />
    <button type="button" onclick="SendPost('#productForm', '/Products/Save', onSuccessCallback, onErrorCallback)">Kaydet</button>
</form>
<script>
    function onSuccessCallback(response) {
        // Örneğin sayfayı yenileyebilirsiniz.
    }

    function onErrorCallback(xhr) {
        //Örneğin gelen hata kayıtlarını konsola yazabilirsiniz.
        console.log("Bir hata oluştu:", xhr);
    }
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

    [Required(ErrorMessage = "Kategori adı zorunludur.")]
    [StringLength(100, ErrorMessage = "Kategori adı 100 karakterden fazla olamaz.")]
    public string CategoryName { get; set; }

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
    //Model içerisinde validasyon yapmak istemediğimiz özelliği kaldırabiliriz.
     ModelState.Remove(nameof(model.CategoryName));

    if (ModelState.IsValid)
    {
        return Json(new { success = true, message = "Ürün başarıyla kaydedildi." });
    }
    else
    {
        return Json(new
        {
            success = false,
            errors = ModelState.Values
                               .SelectMany(v => v.Errors)
                               .Select(e => e.ErrorMessage)
                               .ToList()
        });
    }
}
```

## 3. Tablo İçerisinde Delete işleminin kullanımı

Silinecek kaydın ID'sini ve nesneyi gönderin.

```html
<tr>
    <td>5</td>
    <td>Ürün Adı</td>
    <td><button onclick="DeleteTableItemPost('/Products/Delete', 5, $(this).closest('tr'))">Sil</button></td>
</tr>
```

## 4. Delete işleminin kullanımı

Silinecek kaydın ID'sini gönderin gönderin.

```html
    <button onclick="DeleteItemPost('/Products/Delete', 5)">Kaydı Sil</button>
```

Form verilerinizi HttpPost ile yakalayın ve silme işlemini yapın..
```csharp
[HttpPost]
[ValidateAntiForgeryToken]
public JsonResult Delete(int id)
{
    using(DbContext db = new DbContext)
    {
        ProductModel model = db.ProductModels.Find(id);
        if(model !=null)
        {
            db.ProductModels.Remove(model);
            db.SaveAndChanges();
            return Json(new { success = true, message = "Ürün başarıyla silindi." });

        }else
        {
            return Json(new { success = false, message = "Kayıt Bulunamadı!." });
        }
    }
}
```

## Lisans
Bu proje MIT Lisansı altında lisanslanmıştır. Detaylı bilgi için [LICENSE](LICENSE) dosyasına göz atabilirsiniz.
