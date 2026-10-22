(() => {
  const form = document.getElementById('registration-form');
  if (!form) return;

  const STORAGE_KEY = 'libraryregMembers';
  const getMembers = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  };
  const showAlert = (type, message) => {
    document.getElementById('form-alert').innerHTML = `<div class="alert alert-${type}" role="alert">${message}</div>`;
  };
  const normalize = value => value.trim().toLocaleLowerCase('id-ID');

  form.addEventListener('submit', event => {
    event.preventDefault();
    event.stopPropagation();
    form.classList.add('was-validated');

    const nama = document.getElementById('nama').value.trim();
    const identitas = document.getElementById('identitas').value.trim();
    const jenis = document.getElementById('jenis').value;
    const prodi = document.getElementById('prodi').value.trim();
    const alamat = document.getElementById('alamat').value.trim();
    const telepon = document.getElementById('telepon').value.trim();
    const email = document.getElementById('email').value.trim();

    const phonePattern = /^[+0-9() .-]{8,20}$/;
    const phoneInput = document.getElementById('telepon');
    phoneInput.setCustomValidity(phonePattern.test(telepon) ? '' : 'Nomor telepon tidak valid.');

    const members = getMembers();
    const duplicate = members.some(member => normalize(member.identitas) === normalize(identitas));
    const identitasInput = document.getElementById('identitas');
    identitasInput.setCustomValidity(duplicate ? 'NIM/NIP sudah terdaftar.' : '');

    if (!form.checkValidity()) {
      showAlert('danger', duplicate ? 'NIM/NIP tersebut sudah terdaftar. Gunakan nomor identitas lain.' : 'Periksa kembali kolom yang wajib diisi dan pastikan format datanya benar.');
      form.classList.add('was-validated');
      return;
    }

    const member = {
      id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      nama, identitas, jenis, prodi, alamat, telepon, email,
      tanggalDaftar: new Date().toISOString()
    };
    members.push(member);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    form.reset();
    form.classList.remove('was-validated');
    identitasInput.setCustomValidity('');
    phoneInput.setCustomValidity('');
    showAlert('success', 'Pendaftaran berhasil! Data anggota telah disimpan pada browser ini. <a href="anggota.html" class="alert-link">Lihat daftar anggota</a>.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.getElementById('identitas').addEventListener('input', function() {
    this.setCustomValidity('');
  });
  document.getElementById('telepon').addEventListener('input', function() {
    this.setCustomValidity('');
  });
})();
