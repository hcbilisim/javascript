# EasyPost.js Kütüphanesi

**EasyPost.js**, form verilerini AJAX ile göndermek, form doğrulaması yapmak, dosya yükleme ve ön izleme (preview) özelliklerini yönetmek, ayrıca **SweetAlert2** ile kullanıcıya gelişmiş bildirimler sunmak için kullanılan bir JavaScript kütüphanesidir.

## Özellikler

1. **Form Verilerinin AJAX ile Tek Seferde Gönderimi**  
   Kütüphane, form alanlarını (dosya içermiyorsa) JSON formatında toplayarak sunucuya tek bir POST isteğinde gönderir. Dosya alanı (type="file") varsa, otomatik olarak **FormData** (multipart/form-data) yöntemine geçer. Böylece sayfa yenilemesi olmadan hızlı ve kullanıcı dostu bir deneyim sağlar.

2. **Tablo Satır Silme İşlemlerinde Kolay Kullanım**  
   Tek satırlık bir fonksiyon çağrısıyla, hem sunucudaki kaydı silebilir hem de tabloda ilgili satırı otomatik olarak kaldırabilirsiniz. Projedeki tekrar eden kodlarınızı azaltır.

3. **Özelleştirilebilir Doğrulama Desenleri**  
   Kütüphane, form gönderimleri esnasında isteğe göre ek veriler ekleme ve hata mesajlarını özelleştirme imkânı sunar. Validasyon desenlerinizi iş mantığınıza göre kolaylıkla uyarlayabilirsiniz.

4. **SweetAlert2 ile Gelişmiş Geri Bildirim**  
   Silme onayı, hata mesajları, doğrulama uyarıları gibi durumlarda SweetAlert2 kullanarak görsel olarak zengin diyalog pencereleri oluşturabilirsiniz. Kullanıcı deneyimini iyileştiren, modern ve etkileşimli modal pencereler desteklenir.

5. **ASP.NET MVC Projelerinde `Html.AntiForgeryToken()` Desteği**  
   `[ValidateAntiForgeryToken]` özelliği aktif olan projeler için CSRF (Cross-Site Request Forgery) korumasını devreye sokacak şekilde token’ı otomatik olarak AJAX isteğine ekleyebilirsiniz. Böylece güvenlik açıkları en aza indirilir.

6. **XSS Saldırılarına Karşı HTML Kaçış (Escape) Kontrolü**  
   Kütüphanede yerleşik `escapeHtml` yöntemi, kullanıcı girişlerini veya sunucudan dönen verileri ekrana yansıtmadan önce zararlı script içeriğinden arındırır ve XSS risklerini minimize eder.

7. **Dosya Yükleme ve Ön İzleme (Preview)**  
   - Formunuzda `type="file"` input’u varsa, kütüphane otomatik olarak **FormData** (multipart) isteği yapar.  
   - Dosya alanları için **ön izleme** (preview) özelliği sunar:  
     - **Resimler** için `FileReader` aracılığıyla 150×150 boyutlarında thumbnail gösterir.  
     - **Diğer dosyalar** (PDF, ZIP vb.) için uzantıyı **placeholder** bir görselde (örn. `https://placehold.co/150?text=pdf`) gösterir.

## Başlarken

Bu kütüphaneyi kullanmaya başlamadan önce, projenize **jQuery** ve **SweetAlert2** kütüphanelerini dahil etmeniz gerekir.

### Kurulum

**CDN** olarak `<head>` etiketleri arasında projenize dahil edin:

```html
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="https://cdn.jsdelivr.net/gh/hcbilisim/Javascript/EasyPost.min.js"></script>
```

> **Not**: `EasyPost.min.js` içinde, aşağıda bahsedilen tüm fonksiyonlar (`SendPost`, `DeleteItemPost`, `DeleteTableItemPost`, vb.) ile birlikte dosya ön izleme özelliği de yer almaktadır.

## Kullanım

### 1. Form verilerinin gönderilmesi

Formunuzu ve `SendPost` fonksiyonunu aşağıdaki gibi kullanabilirsiniz. Eğer `type="file"` input’u **yoksa**, kütüphane verileri **JSON** olarak gönderir. Varsa, **FormData** (multipart/form-data) olarak gönderir.

```html
<form id="productForm">
    <input type="hidden" name="__RequestVerificationToken" value="@AntiForgeryTokenValue" />
    <input type="text" name="Name" />
    <input type="number" name="Price" />
    <button type="button" onclick="SendPost('#productForm', '/Products/Save', onSuccessCallback, onErrorCallback)">Kaydet</button>
</form>

<script>
    function onSuccessCallback(response) {
        // Örneğin sayfayı yenileyebilirsiniz veya modal kapatabilirsiniz.
        console.log("Başarılı:", response);
    }

    function onErrorCallback(xhr) {
        // Örneğin gelen hata kayıtlarını konsola yazabilirsiniz.
        console.log("Bir hata oluştu:", xhr);
    }
</script>
```

### 2. Dosya Yükleme ve Ön İzleme

#### 2.1. Örnek Form (Dosyalı)

```html
<form id="uploadForm">
    <input type="hidden" name="__RequestVerificationToken" value="@AntiForgeryTokenValue" />

    <label>Tekli Resim:</label>
    <input type="file" name="SingleImage" accept="image/*" />

    <label>Çoklu Resim:</label>
    <input type="file" name="MultiImages" accept="image/*" multiple />

    <label>Dosya:</label>
    <input type="file" name="AnyFile" />

    <button type="button" onclick="uploadFiles()">Yükle</button>
</form>

<script>
    function uploadFiles() {
        SendPost('#uploadForm', '/Uploads/Handle', 
            function(resp) { console.log("Başarılı:", resp); }, 
            function(err) { console.error("Hata:", err); });
    }
</script>
```

#### 2.2. Client-Side Ön İzleme

**EasyPost.js** içindeki `initFilePreview` fonksiyonu, sayfadaki tüm `input[type="file"]` alanlarını tarar. Kullanıcı bir dosya seçtiğinde:

- Resim dosyası (`image/*`) ise, **150×150** boyutlarında küçük bir thumbnail gösterir.  
- Diğer dosya türlerinde, dosyanın uzantısını (ör. “pdf”) `https://placehold.co/150?text=pdf` benzeri bir görselde gösterir.

**Sayfa açılırken** veya **document.ready** içinde, `initFilePreview()` fonksiyonunu çağırmayı unutmayın:

```html
<script>
    $(document).ready(function() {
        // EasyPost kütüphanesindeki ön izleme sistemini etkinleştir
        initFilePreview();
    });
</script>
```

Böylece, kullanıcı dosya seçer seçmez hemen input’un yanındaki alanda (otomatik eklenen `<div class="hc-file-preview">`) küçük ön izlemeyi görecektir.

### 3. C# Tarafında Post Verilerini İşleme ve Doğrulama

Aşağıda, **ASP.NET Core** tarafında bir **ProductModel** ve onun `Save` metodu örneği yer almaktadır.

#### 3.1. Modelinizi Hazırlayın

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

    // İsteğe bağlı ek alanlar
    // Örneğin Kategori vs.
}
```

#### 3.2. Form Verilerinizi `HttpPost` ile Yakalayın ve Doğrulamayı Sağlayın

```csharp
[HttpPost]
[ValidateAntiForgeryToken]
public JsonResult Save(ProductModel model)
{
    // ModelState.Remove("...") ile bazı validasyonları devre dışı bırakabilirsiniz.
    // Örneğin:
    // ModelState.Remove(nameof(model.CategoryName));

    if (ModelState.IsValid)
    {
        // Veritabanına kaydedebilir veya başka işlemler yapabilirsiniz.
        return Json(new { success = true, message = "Ürün başarıyla kaydedildi." });
    }
    else
    {
        // Validasyon hatalarını JSON olarak döndürüyoruz. 
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

### 4. Tablo İçerisinde Delete İşleminin Kullanımı

Tablonuzda bir satır silme butonu kullanmak için `DeleteTableItemPost` fonksiyonunu çağırabilirsiniz. Silme işlemi, **sunucu tarafında** kaydı kaldırdıktan sonra **DOM**’dan ilgili satırı da (`row.remove()`) temizler.

```html
<tr>
    <td>5</td>
    <td>Ürün Adı</td>
    <td>
        <button onclick="DeleteTableItemPost('/Products/Delete', 5, $(this).closest('tr'), '@Html.AntiForgeryTokenValue')">
            Sil
        </button>
    </td>
</tr>
```

> **Not**: Parametre sırası: `DeleteTableItemPost(apiUrl, id, row, csrfToken)`

### 5. Delete İşleminin Kullanımı

Eğer **DOM üzerinde** herhangi bir öğeyi kaldırmak istemiyorsanız ve sadece sunucu tarafında kaydı silmek isterseniz `DeleteItemPost` fonksiyonunu kullanabilirsiniz:

```html
<button onclick="DeleteItemPost('/Products/Delete', 5, '@Html.AntiForgeryTokenValue')">
    Kaydı Sil
</button>
```

### 6. C# Tarafında Silme Metodu

```csharp
[HttpPost]
[ValidateAntiForgeryToken]
public JsonResult Delete(int id)
{
    using(MyDbContext db = new MyDbContext())
    {
        var model = db.ProductModels.Find(id);
        if(model != null)
        {
            db.ProductModels.Remove(model);
            db.SaveChanges();
            return Json(new { success = true, message = "Ürün başarıyla silindi." });
        }
        else
        {
            return Json(new { success = false, message = "Kayıt Bulunamadı!." });
        }
    }
}
```

### 7. Örnek: Dosya Yükleme (C# Tarafı)

Kütüphanemiz **`SendPost`** metodu ile formda dosya alanı (`type="file"`) varsa **FormData** olarak isteği gönderir. Aşağıda, ASP.NET Core tarafında dosyayı yakalama örneği verilmiştir.

```csharp
[HttpPost]
[ValidateAntiForgeryToken]
public async Task<IActionResult> Handle(IFormFile SingleImage, List<IFormFile> MultiImages)
{
    // Dosya kayıt işlemleri
    // Örneğin, disk veya bulut depolamaya kaydedebilirsiniz.
    
    // Tekli dosya
    if (SingleImage != null)
    {
        // kaydet...
    }

    // Çoklu dosyalar
    if (MultiImages != null && MultiImages.Count > 0)
    {
        foreach(var file in MultiImages)
        {
            // kaydet...
        }
    }

    return Ok("Dosyalar başarıyla alındı.");
}
```

---

## İleri Seviye Özelleştirmeler

1. **Validasyon Kuralları**  
   - ASP.NET MVC’de `[Required]`, `[Range]` gibi DataAnnotations’ları kullanabilir, dönen hataları client-side’da **SweetAlert2** ile gösterebilirsiniz.  
   - Kütüphanede isterseniz ek regex kontrolleri, custom validation vb. yapabilirsiniz.

2. **Genişletilebilir Dosya Ön İzleme**  
   - Varsayılan olarak 150×150 boyutunda gösterilen ön izlemeyi CSS veya JavaScript ile kolayca özelleştirebilirsiniz.  
   - PDF, DOCX gibi popüler dosya türleri için özel ikonlar ekleyebilirsiniz (örn. `<img src="pdf-icon.png">`).

3. **Global Hata Yönetimi**  
   - Kütüphanede, sunucudan `500 Internal Server Error` döndüğünde otomatik olarak “Sunucu Hatası” uyarısı göstersin diye `ajaxError` dinleyicisi bulunmaktadır.  
   - İsteğe göre 404, 403 vb. durumlar için de benzer yaklaşımlar eklenebilir.

4. **Drag & Drop**  
   - Dosya yükleme alanlarında drag&drop desteği isteniyorsa, ek JS event’leri eklenerek kütüphaneye genişletme yapılabilir.

---

## Lisans

Bu proje **MIT Lisansı** altında lisanslanmıştır. Detaylı bilgi için [LICENSE](LICENSE) dosyasına göz atabilirsiniz.

---

## Katkıda Bulunun

Projeye katkıda bulunmak için **Pull Request** gönderebilir veya **Issue** açarak görüşlerinizi paylaşabilirsiniz.  

> **Not**: Yeni bir özellik eklediyseniz veya hata düzelttiyseniz, lütfen README’de ilgili bölümlere güncelleme yaparak kullanım örneği ekleyin.

---

## İletişim

- E-posta: [info@hcbilisim.com](mailto:info@hcbilisim.com)  
- Web: [https://hcbilisim.com](https://hcbilisim.com)

Bu rehberin ötesinde bir sorun ya da özel ihtiyaçlarınız varsa, lütfen iletişime geçmekten çekinmeyin. Keyifli kodlamalar!
