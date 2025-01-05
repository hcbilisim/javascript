(function ($) {

    // XSS saldırılarına karşı güvenli bir şekilde kullanıcı girdilerini işlemek için HTML escape fonksiyonu
    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * Kayıt Silme Fonksiyonu (Sadece sunucu tarafında kaydı siler, DOM üzerinde herhangi bir değişiklik yapmaz)
     * @param {string} apiUrl  - Silme isteğini göndereceğimiz adres (örnek: '/Products/Delete')
     * @param {number} id      - Silinecek kaydın ID'si
     * @param {string} csrfToken - ASP.NET tarafında [ValidateAntiForgeryToken] kullanıyorsanız bu token'ı da göndermelisiniz
     */
    window.DeleteItemPost = function DeleteItemPost(apiUrl, id, csrfToken) {
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
            // SweetAlert2@11 için: result.isConfirmed
            if (result.isConfirmed) {
                // Token'ı POST verisine ekliyoruz
                const dataToSend = {
                    id: id,
                    __RequestVerificationToken: csrfToken
                };

                $.post(apiUrl, dataToSend)
                    .then(function (response) {
                        // Sunucudan gelen yanıtı kullanıcıya gösteriyoruz
                        Swal.fire('Başarılı!', escapeHtml(response), 'success');
                    })
                    .catch(function (error) {
                        // Hata detayını yakalıyoruz
                        var errorMessage = (error.responseJSON && error.responseJSON.errors)
                            ? escapeHtml(error.responseJSON.errors[0])
                            : "Bir hata oluştu.";
                        Swal.fire('Hata!', errorMessage, 'error');
                    });
            }
        });
    };

    /**
     * Tablo öğesini ve ilgili kaydı silme fonksiyonu
     * (Sunucu tarafında kaydı siler, başarılı olursa DOM'dan belirtilen tablo satırını da kaldırır)
     * @param {string}  apiUrl  - Silme isteğini göndereceğimiz adres (örnek: '/Products/Delete')
     * @param {number}  id      - Silinecek kaydın ID'si
     * @param {object}  row     - jQuery veya DOM element (tr). Silme başarı olursa bu satırı kaldırırız
     * @param {string}  csrfToken - ASP.NET tarafında [ValidateAntiForgeryToken] için gereken token
     */
    window.DeleteTableItemPost = function DeleteTableItemPost(apiUrl, id, row, csrfToken) {
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
                // Token'ı POST verisine ekliyoruz
                const dataToSend = {
                    id: id,
                    __RequestVerificationToken: csrfToken
                };

                $.post(apiUrl, dataToSend)
                    .then(function (response) {
                        // DOM'dan satırı (tr) kaldırıyoruz
                        row.remove();
                        // Sunucudan gelen yanıtı kullanıcıya gösteriyoruz
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
    };


    // AJAX Post İşlemi Fonksiyonu
    window.SendPost = function (formSelector, apiUrl, onSuccess, onError, extraData) {
        var formDataObj = {};
        $(formSelector).serializeArray().forEach(function (field) {
            formDataObj[field.name] = field.value;
        });

        if (extraData) {
            Object.assign(formDataObj, extraData);
        }

        var token = $(formSelector).find('input[name="__RequestVerificationToken"]').val();
        if (token) {
            formDataObj['__RequestVerificationToken'] = token;
        }

        Swal.fire({
            title: 'Yükleniyor...',
            html: 'İşleminiz gerçekleştiriliyor, lütfen bekleyin.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

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
    };

    // Doğrulama Hatalarını İşleme Fonksiyonu
    function handleValidationErrors(xhr) {
        var response = xhr.responseJSON;
        if (xhr.status === 400 && response) {
            var errors = response.errors;
            var errorMessageHtml = '';

            if (Array.isArray(errors)) {
                errorMessageHtml = errors.map(error => `<li>${escapeHtml(error)}</li>`).join('');
            } else if (typeof errors === 'object') {
                errorMessageHtml = Object.keys(errors).map(key => errors[key].map(error => `<li>${escapeHtml(error)}</li>`).join('')).join('');
            }

            Swal.fire({
                icon: 'error',
                title: 'Doğrulama Hataları',
                html: `<ul>${errorMessageHtml}</ul>`,
            });
        } else {
            Swal.fire('Hata!', 'Bir hata oluştu: ' + escapeHtml(xhr.responseText), 'error');
        }
    }

    // Ek hata kontrolü ekleme: Sunucu hataları (500, 404 vb.)
    $(document).ajaxError(function (event, jqxhr, settings, thrownError) {
        if (jqxhr.status === 500) {
            Swal.fire('Sunucu Hatası', 'Sunucu hatası oluştu, lütfen tekrar deneyin.', 'error');
        }
    });

}(jQuery));
