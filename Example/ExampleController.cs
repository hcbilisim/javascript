using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using System;

namespace ExampleProject.Controllers
{
    public class ExampleController : Controller
    {
        // ==============================
        // 1) Ürün Kaydetme (JSON post)
        // ==============================
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult SaveProduct([FromBody] ProductModel model)
        {
            // Örnek validasyon
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors)
                                              .Select(e => e.ErrorMessage)
                                              .ToList();
                return BadRequest(new { errors });
            }

            // Model valid ise kaydı oluşturabilir (Veritabanı işlemleri)
            // ...

            return Ok("Ürün başarıyla kaydedildi.");
        }

        // ==============================
        // 2) Ürün Silme (ID parametresi)
        // ==============================
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult DeleteProduct(int id)
        {
            // Burada DB tarafında id değerini bulup kaydı silersiniz
            // Örnek: var product = _dbContext.Products.Find(id);

            bool recordExists = (id == 101 || id == 102); // Demo amaçlı
            
            if (!recordExists)
            {
                return BadRequest(new { errors = new[] { "Kayıt bulunamadı." } });
            }

            // _dbContext.Products.Remove(product);
            // _dbContext.SaveChanges();

            return Ok($"Ürün (ID={id}) başarıyla silindi.");
        }

        // ==============================
        // 3) Dosya Yükleme (FormData)
        // ==============================
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> HandleFiles(IFormFile SingleImage, List<IFormFile> MultiFiles, string Title)
        {
            try
            {
                // var uploadsPath = Path.Combine(_env.WebRootPath, "uploads");
                // Directory.CreateDirectory(uploadsPath);

                // Tekli resim
                if (SingleImage != null && SingleImage.Length > 0)
                {
                    // var filePath = Path.Combine(uploadsPath, SingleImage.FileName);
                    // using var fs = new FileStream(filePath, FileMode.Create);
                    // await SingleImage.CopyToAsync(fs);
                    // ...
                }

                // Çoklu dosyalar
                if (MultiFiles != null && MultiFiles.Any())
                {
                    foreach (var file in MultiFiles)
                    {
                        // var filePath = Path.Combine(uploadsPath, file.FileName);
                        // using var fs = new FileStream(filePath, FileMode.Create);
                        // await file.CopyToAsync(fs);
                        // ...
                    }
                }

                Console.WriteLine("Gelen Title: " + Title);

                return Ok("Dosyalar ve diğer form verileri başarıyla alındı.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"İşlem sırasında hata oluştu: {ex.Message}");
            }
        }
    }

    // ==============================
    // MODEL
    // ==============================
    public class ProductModel
    {
        [Required(ErrorMessage = "Ürün adı zorunludur.")]
        [StringLength(100, ErrorMessage = "Ürün adı en fazla 100 karakter olabilir.")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Fiyat zorunludur.")]
        [Range(0.01, 10000, ErrorMessage = "Fiyat 0.01 ile 10000 arasında olmalıdır.")]
        public decimal Price { get; set; }
    }
}
