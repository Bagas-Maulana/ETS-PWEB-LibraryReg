(() => {
  const STORAGE_KEY = 'libraryregMembers';
  const tbody = document.getElementById('member-table-body');
  if (!tbody) return;

  const getMembers = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  };
  const saveMembers = members => localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[char]));
  const formatDate = value => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  const showAlert = (type, message) => {
    document.getElementById('members-alert').innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Tutup"></button></div>`;
  };

  function renderMembers(query = '') {
    const allMembers = getMembers();
    const term = query.trim().toLocaleLowerCase('id-ID');
    const filtered = allMembers.filter(member =>
      [member.nama, member.identitas, member.email, member.jenis].some(value => String(value || '').toLocaleLowerCase('id-ID').includes(term))
    );
    document.getElementById('member-count').textContent = allMembers.length;
    document.getElementById('empty-state').classList.toggle('d-none', filtered.length > 0);
    tbody.innerHTML = filtered.map(member => `
      <tr>
        <td><strong>${escapeHtml(member.nama)}</strong><div class="small text-muted">${escapeHtml(member.prodi || 'Unit tidak diisi')}</div></td>
        <td>${escapeHtml(member.identitas)}</td>
        <td><span class="service-tag">${escapeHtml(member.jenis)}</span></td>
        <td>${escapeHtml(member.email)}</td>
        <td>${formatDate(member.tanggalDaftar)}</td>
        <td><div class="action-buttons">
          <button class="btn btn-sm btn-outline-secondary" data-action="detail" data-id="${escapeHtml(member.id)}">Detail</button>
          <button class="btn btn-sm btn-outline-success" data-action="edit" data-id="${escapeHtml(member.id)}">Edit</button>
          <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${escapeHtml(member.id)}">Hapus</button>
        </div></td>
      </tr>`).join('');
    if (filtered.length === 0 && allMembers.length > 0) {
      document.getElementById('empty-state').classList.remove('d-none');
      document.getElementById('empty-state').innerHTML = '<h3 class="h5">Data tidak ditemukan</h3><p class="text-muted">Coba kata kunci pencarian yang lain.</p>';
    } else if (allMembers.length === 0) {
      document.getElementById('empty-state').innerHTML = '<div class="feature-icon mx-auto">▤</div><h3 class="h5 mt-3">Belum ada data anggota</h3><p class="text-muted">Silakan tambahkan anggota melalui formulir pendaftaran.</p><a href="pendaftaran.html" class="btn btn-library">Daftarkan Anggota</a>';
    }
  }

  const findMember = id => getMembers().find(member => member.id === id);
  const detailModal = () => bootstrap.Modal.getOrCreateInstance(document.getElementById('member-detail-modal'));
  const editModal = () => bootstrap.Modal.getOrCreateInstance(document.getElementById('member-edit-modal'));

  document.getElementById('member-search').addEventListener('input', event => renderMembers(event.target.value));

  tbody.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const { action, id } = button.dataset;
    const member = findMember(id);
    if (!member) return;

    if (action === 'detail') {
      const rows = [
        ['Nama lengkap', member.nama], ['NIM/NIP', member.identitas], ['Jenis keanggotaan', member.jenis],
        ['Program studi / unit', member.prodi || '-'], ['Alamat', member.alamat], ['Nomor telepon', member.telepon],
        ['Email', member.email], ['Tanggal daftar', formatDate(member.tanggalDaftar)]
      ];
      document.getElementById('member-detail-body').innerHTML = rows.map(([label, value]) => `<div class="detail-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('');
      detailModal().show();
    } else if (action === 'edit') {
      document.getElementById('edit-id').value = member.id;
      document.getElementById('edit-nama').value = member.nama;
      document.getElementById('edit-identitas').value = member.identitas;
      document.getElementById('edit-jenis').value = member.jenis;
      document.getElementById('edit-prodi').value = member.prodi || '';
      document.getElementById('edit-alamat').value = member.alamat;
      document.getElementById('edit-telepon').value = member.telepon;
      document.getElementById('edit-email').value = member.email;
      document.getElementById('edit-alert').innerHTML = '';
      document.getElementById('edit-member-form').classList.remove('was-validated');
      editModal().show();
    } else if (action === 'delete') {
      if (window.confirm(`Hapus data anggota "${member.nama}" (${member.identitas})? Tindakan ini tidak dapat dibatalkan.`)) {
        saveMembers(getMembers().filter(item => item.id !== id));
        renderMembers(document.getElementById('member-search').value);
        showAlert('success', `Data anggota ${escapeHtml(member.nama)} berhasil dihapus.`);
      }
    }
  });

  document.getElementById('edit-member-form').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    form.classList.add('was-validated');
    const id = document.getElementById('edit-id').value;
    const updated = {
      nama: document.getElementById('edit-nama').value.trim(),
      identitas: document.getElementById('edit-identitas').value.trim(),
      jenis: document.getElementById('edit-jenis').value,
      prodi: document.getElementById('edit-prodi').value.trim(),
      alamat: document.getElementById('edit-alamat').value.trim(),
      telepon: document.getElementById('edit-telepon').value.trim(),
      email: document.getElementById('edit-email').value.trim()
    };
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[+0-9() .-]{8,20}$/;
    const duplicate = getMembers().some(member => member.id !== id && member.identitas.toLocaleLowerCase('id-ID') === updated.identitas.toLocaleLowerCase('id-ID'));
    const alertBox = document.getElementById('edit-alert');
    if (!updated.nama || !updated.identitas || !updated.jenis || !updated.alamat || !emailPattern.test(updated.email) || !phonePattern.test(updated.telepon) || duplicate) {
      alertBox.innerHTML = `<div class="alert alert-danger">${duplicate ? 'NIM/NIP sudah digunakan anggota lain.' : 'Periksa kembali semua kolom wajib dan format email/telepon.'}</div>`;
      return;
    }
    const members = getMembers().map(member => member.id === id ? { ...member, ...updated } : member);
    saveMembers(members);
    editModal().hide();
    renderMembers(document.getElementById('member-search').value);
    showAlert('success', 'Data anggota berhasil diperbarui.');
  });

  renderMembers();
})();
