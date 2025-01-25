(function ($) {
    "use strict";

    // ------------------------
    // Yardımcı Fonksiyonlar
    // ------------------------

    function escapeHtml(text) {
        if (!text) return "";
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
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

    function getCsrfToken() {
        return $('meta[name="csrf-token"]').attr('content');
    }

    // ------------------------
    // Silme Fonksiyonları
    // ------------------------

    function DeleteItemPost(apiUrl, id) {
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
                var token = getCsrfToken();

                var dataToSend = {
                    id: id,
                    __RequestVerificationToken: token
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

    function DeleteTableItemPost(apiUrl, id, row) {
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
                var token = getCsrfToken();

                var dataToSend = {
                    id: id,
                    __RequestVerificationToken: token
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

        var token = getCsrfToken();

        if (hasFileInput) {
            var formData = new FormData($form[0]);
            if (extraData && typeof extraData === 'object') {
                for (var key in extraData) {
                    formData.append(key, extraData[key]);
                }
            }
            if (token) {
                formData.append('__RequestVerificationToken', token);
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
        } else {
            var formDataObj = {};
            $form.serializeArray().forEach(function (field) {
                formDataObj[field.name] = field.value;
            });

            if (extraData) {
                Object.assign(formDataObj, extraData);
            }
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
    window.EasyPost = {
        DeleteItemPost: DeleteItemPost,
        DeleteTableItemPost: DeleteTableItemPost,
        SendPost: SendPost
    };

})(jQuery);
