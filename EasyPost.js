(function ($) {
    "use strict";

    // ------------------------
    // Yardımcı Fonksiyonlar
    // ------------------------

    function escapeHtml(text) {
        if (!text) return "";
        return text
            .replace(/&/g, "&amp;")
            .replace(/<//g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function handleValidationErrors(xhr) {
        var response = xhr.responseJSON;
        if (xhr.status === 400 && response) {
            var errors = response.errors;
            var errorMessageHtml = '';

            if (Array.isArray(errors)) {
                errorMessageHtml = errors.map(function (err) {
                    return '<li>' + escapeHtml(err) + '</li>';
                }).join('');
            } else if (typeof errors === 'object') {
                errorMessageHtml = Object.keys(errors).map(function (key) {
                    return errors[key].map(function (err) {
                        return '<li>' + escapeHtml(err) + '</li>';
                    }).join('');
                }).join('');
            }

            Swal.fire({
                icon: 'error',
                title: 'Doğrulama Hataları',
                html: '<ul>' + errorMessageHtml + '</ul>',
            });
        } else {
            Swal.fire('Hata!', 'Bir hata oluştu: ' + escapeHtml(xhr.responseText), 'error');
        }
    }

    // ------------------------
    // Silme Fonksiyonları
    // ------------------------

    function DeleteItemPost(apiUrl, id, csrfToken) {
        Swal.fire({
            title: 'Silme Onay',
            text: 'Silmek istediğinize emin misiniz?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sil',
            cancelButtonText: 'İptal'
        }).then((result) => {
            if (result.isConfirmed) {
                var dataToSend = {
                    id: id,
                    __RequestVerificationToken: csrfToken
                };

                $.post(apiUrl, dataToSend)
                    .then(function (response) {
                        Swal.fire('Başarılı!', escapeHtml(response), 'success');
                    })
                    .catch(function (error) {
                        var errorMessage = (error.responseJSON && error.responseJSON.errors)
                            ? escapeHtml(error.responseJSON.errors[0])
                            : "Bir hata oluştu.";
                        Swal.fire('Hata!', errorMessage, 'error');
                    });
            }
        });
    }

    function DeleteTableItemPost(apiUrl, id, row, csrfToken) {
        Swal.fire({
            title: escapeHtml('Silme Onay'),
            text: escapeHtml("Silmek istediğinize emin misiniz?"),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sil',
            cancelButtonText: 'İptal'
        }).then((result) => {
            if (result.isConfirmed) {
                var dataToSend = {
                    id: id,
                    __RequestVerificationToken: csrfToken
                };

                $.post(apiUrl, dataToSend)
                    .then(function (response) {
                        if (row) {
                            $(row).remove();
                        }
                        Swal.fire('Başarılı!', escapeHtml(response), 'success');
                    })
                    .catch(function (error) {
                        var errorMessage = (error.responseJSON && error.responseJSON.errors)
                            ? escapeHtml(error.responseJSON.errors[0])
                            : "Bir hata oluştu.";
                        Swal.fire('Hata!', errorMessage, 'error');
                    });
            }
        });
    }

    // ------------------------
    // Form Gönderme (SendPost)
    // ------------------------
    function SendPost(formSelector, apiUrl, onSuccess, onError, extraData) {
        var $form = $(formSelector);
        var hasFileInput = $form.find('input[type="file"]').length > 0;

        Swal.fire({
            title: 'Yükleniyor...',
            html: 'İşleminiz gerçekleştiriliyor, lütfen bekleyin.',
            allowOutsideClick: false,
            didOpen: function () {
                Swal.showLoading();
            }
        });

        if (hasFileInput) {
            var formData = new FormData($form[0]);
            if (extraData && typeof extraData === 'object') {
                for (var key in extraData) {
                    formData.append(key, extraData[key]);
                }
            }

            $.ajax({
                url: apiUrl,
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                success: function (response) {
                    Swal.close();
                    Swal.fire('Başarılı!', escapeHtml(response), 'success');
                    if (onSuccess) onSuccess(response);
                },
                error: function (xhr) {
                    Swal.close();
                    handleValidationErrors(xhr);
                    if (onError) onError(xhr);
                }
            });
        }
        else {
            var formDataObj = {};
            $form.serializeArray().forEach(function (field) {
                formDataObj[field.name] = field.value;
            });

            if (extraData) {
                Object.assign(formDataObj, extraData);
            }

            var token = $form.find('input[name="__RequestVerificationToken"]').val();
            if (token) {
                formDataObj['__RequestVerificationToken'] = token;
            }

            $.ajax({
                type: "POST",
                url: apiUrl,
                contentType: 'application/json',
                data: JSON.stringify(formDataObj),
                success: function (response) {
                    Swal.close();
                    Swal.fire('Başarılı!', escapeHtml(response), 'success');
                    if (onSuccess) onSuccess(response);
                },
                error: function (xhr) {
                    Swal.close();
                    handleValidationErrors(xhr);
                    if (onError) onError(xhr);
                }
            });
        }
    }

    // ------------------------
    // ÖN İZLEME İÇİN GEREKLİLER
    // ------------------------

    /**
     * Bu fonksiyon, tüm input[type="file"] alanlarını bulur.
     * Her bir input'un yanına (veya altına) .hc-file-preview adlı bir DIV ekler.
     * Dosya(lar) seçildiğinde, bu DIV içinde 150x150 boyutunda ön izlemeler oluşturur.
     */
    function initFilePreview() {
        // Tüm file input'ları bulalım
        $('input[type="file"]').each(function () {
            var $input = $(this);

            // Zaten var mı diye kontrol (tekrarlı eklemesin)
            if ($input.next('.hc-file-preview').length === 0) {
                // Ön izleme için bir div oluştur
                var $previewContainer = $('<div class="hc-file-preview" style="margin-top:5px;"></div>');
                // DOM'a ekle (isterseniz .parent() konumuna göre değiştirin)
                $input.after($previewContainer);
            }

            // Change event
            $input.off('change.hcPreview').on('change.hcPreview', function () {
                var $container = $(this).next('.hc-file-preview');
                $container.empty();  // Önceki ön izlemeleri temizle

                var files = this.files;
                if (!files || files.length === 0) return;

                for (var i = 0; i < files.length; i++) {
                    generatePreview(files[i], $container);
                }
            });
        });
    }

    /**
     * generatePreview:
     *  - Eğer resim dosyasıysa (image/*), FileReader ile base64'e çevirerek <img> gösterir (150x150).
     *  - Aksi durumda, dosya uzantısını alır ve https://placehold.co/150?text=EXT resmini gösterir.
     */
    function generatePreview(file, $container) {
        if (file.type && file.type.startsWith('image/')) {
            // Resim
            var reader = new FileReader();
            reader.onload = function (e) {
                var $img = $('<img>', {
                    src: e.target.result,
                    css: { width: '150px', height: '150px', objectFit: 'cover', marginRight: '5px', marginBottom: '5px' }
                });
                $container.append($img);
            };
            reader.readAsDataURL(file);
        } else {
            // Resim değil -> uzantı alalım
            var ext = getFileExtension(file.name);
            if (!ext) {
                ext = 'DOSYA'; // uzantı bulunamadı
            }

            // placehold.co/150?text=pdf
            var src = 'https://placehold.co/150?text=' + encodeURIComponent(ext);
            var $img = $('<img>', {
                src: src,
                css: { width: '150px', height: '150px', objectFit: 'contain', background: '#f0f0f0', marginRight: '5px', marginBottom: '5px' }
            });
            $container.append($img);
        }
    }

    // Küçük yardımcı fonksiyon: "document.pdf" -> "pdf", "archive.tar.gz" -> "gz"
    function getFileExtension(filename) {
        if (!filename) return '';
        // "myfile.png" -> ["myfile","png"]
        var parts = filename.split('.');
        if (parts.length < 2) return '';
        return parts[parts.length - 1].toLowerCase(); 
    }

    // ------------------------
    // Global AJAX Error Handler (500 vb.)
    // ------------------------
    $(document).ajaxError(function (event, jqxhr) {
        if (jqxhr.status === 500) {
            Swal.fire('Sunucu Hatası', 'Sunucu hatası oluştu, lütfen tekrar deneyin.', 'error');
        }
    });

    // ------------------------
    // Kütüphaneyi Tek Objede Toplayalım
    // ------------------------
    window.HcAjaxLibrary = {
        // Silme fonksiyonları
        DeleteItemPost: DeleteItemPost,
        DeleteTableItemPost: DeleteTableItemPost,

        // Form gönderme fonksiyonu
        SendPost: SendPost,

        // File preview başlatıcı
        initFilePreview: initFilePreview
    };

})(jQuery);
