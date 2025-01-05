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

   // Kayıt Silme Fonksiyonu
    window.DeleteItemPost = function Delete(apiUrl, id) {
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
            if (result.value) {
                $.post(apiUrl, { id })
                    .then(function (data) {
                        // Sunucuya istek atıldıktan sonra, yalnızca başarı mesajı göstermek
                        // (DOM’dan herhangi bir eleman silmiyoruz)
                        Swal.fire('Başarılı!', data, 'success');
                    })
                    .catch(function (error) {
                        var errorMessage = error.responseJSON
                            ? error.responseJSON.errors[0]
                            : "Bir hata oluştu.";
                        Swal.fire('Hata!', errorMessage, 'error');
                    });
            }
        });
    };
    
    // Tablo öğesini ve ilgili kaydı silme fonksiyonu
    window.DeleteTableItemPost = function Delete(apiUrl, id, row) {
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
            if (result.value) {
                $.post(apiUrl, { id })
                    .then(function (data) {
                        row.remove();
                        Swal.fire('Başarılı!', escapeHtml(data), 'success');
                    })
                    .catch(function (error) {
                        var errorMessage = error.responseJSON ? escapeHtml(error.responseJSON.errors[0]) : "Bir hata oluştu.";
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
