(function($) {
    // SweetAlert2'yi Dinamik Olarak Yükle
    function loadSweetAlert2(callback) {
        if (typeof Swal === "undefined") {
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
            document.head.appendChild(script);
            script.onload = () => {
                console.log("SweetAlert2 yüklendi.");
                if (typeof callback === "function") callback();
            };
        } else {
            if (typeof callback === "function") callback();
        }
    }

    // E-posta Doğrulama Fonksiyonu
    function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,4}\.[0-9]{1,4}\.[0-9]{1,4}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    // Sayısal Değer Doğrulama Fonksiyonu
    function validateNumber(number) {
        return !isNaN(parseFloat(number)) && isFinite(number);
    }

    // Tarih Doğrulama Fonksiyonu
    function validateDate(date) {
        return !isNaN(Date.parse(date));
    }

    // Telefon Numarası Doğrulama Fonksiyonu
    function validatePhone(phone) {
        var re = /^(\+?\d{1,3}[- ]?)?\d{10}$/;
        return re.test(phone);
    }

    // Form Doğrulama Fonksiyonu
    function validateForm(formSelector) {
        var errors = [];
        $(formSelector + ' :input[required]').each(function() {
            var inputType = $(this).attr('type');
            var inputValue = $(this).val();
            var inputName = $(this).attr('name');
            var pattern = $(this).attr('pattern');
            var label = $(this).attr('label') || inputName; // 'label' attribute'u varsa kullan, yoksa 'name' attribute'unu kullan

            // Zorunlu alan kontrolü
            if (!inputValue) {
                errors.push(label + ' alanı zorunludur.');
            } else {
                // Özel pattern varsa bu desene göre doğrula
                if (pattern && !new RegExp(pattern).test(inputValue)) {
                    errors.push(label + ' alanı geçersiz.');
                } else {
                    // Tip bazlı ekstra doğrulamalar
                    switch (inputType) {
                        case 'email':
                            if (!validateEmail(inputValue)) {
                                errors.push('Geçerli bir e-posta adresi giriniz.');
                            }
                            break;
                        case 'number':
                            if (!validateNumber(inputValue)) {
                                errors.push(label + ' alanı için geçerli bir sayı giriniz.');
                            }
                            break;
                        case 'date':
                            if (!validateDate(inputValue)) {
                                errors.push(label + ' alanı için geçerli bir tarih giriniz.');
                            }
                            break;
                        case 'tel':
                            if (!validatePhone(inputValue)) {
                                errors.push('Geçerli bir telefon numarası giriniz.');
                            }
                            break;
                    }
                }
            }
        });

        return errors;
    }

    // Form Doğrulama Hatalarını Göster
    function showValidationErrors(errors) {
        loadSweetAlert2(function() {
            Swal.fire({
                icon: 'error',
                title: 'Hata!',
                html: 'Lütfen aşağıdaki hataları düzeltin:<br><ul><li style="text-align: left;color: #ee7272;">' + errors.join('</li><li style="text-align: left;color: #ee7272;" >') + '</li></ul>',
            });
        });
    }

    // Başlangıçta SweetAlert2'yi Yükle
    $(document).ready(function() {
        loadSweetAlert2();
    });

    // AJAX Post İşlemi Fonksiyonu
    window.SendPost = function(formSelector, apiUrl, onSuccess, onError, extraData) {
        var errors = validateForm(formSelector);
        if (errors.length > 0) {
            showValidationErrors(errors);
            return;
        }

        // SweetAlert2 ile yükleme bildirimi göster
        loadSweetAlert2(function() {
            Swal.fire({
                title: 'Yükleniyor...',
                html: 'İşleminiz gerçekleştiriliyor, lütfen bekleyin.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
        });

        var formData = $(formSelector).serialize();
        if (extraData) {
            formData += '&' + $.param(extraData);
        }

          // Anti-forgery token'ı form verilerine ekle
        var token = $(formSelector).find('input[name="__RequestVerificationToken"]').val();
        if (token) {
            formData += '&__RequestVerificationToken=' + encodeURIComponent(token);
        }

        $.ajax({
            type: "POST",
            url: apiUrl,
            data: formData,
            success: function(response) {
                Swal.close(); // SweetAlert2 bildirimini kapat
                Swal.fire('Başarılı!', 'İşlem başarıyla tamamlandı.', 'success');
                if (onSuccess) onSuccess(response);
            },
            error: function(xhr, status, error) {
                Swal.close(); // SweetAlert2 bildirimini kapat
                Swal.fire('Hata!', 'Bir hata oluştu: ' + error, 'error');
                if (onError) onError(xhr, status, error);
            }
        });
    };
}(jQuery));
