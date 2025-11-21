// js/payment-page.js

document.addEventListener('DOMContentLoaded', () => {
    // Fungsi untuk mengunduh QRIS
    window.downloadQRIS = async function() { // Jadikan global agar bisa diakses dari HTML inline
        const qrisImage = document.getElementById('qrisImage');
        if (qrisImage) {
            const imageUrl = qrisImage.src;
            try {
                const response = await fetch(imageUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.href = url;
                // Nama file akan disesuaikan di setiap halaman HTML
                // Misalnya, 'GoPay_QRIS_Arexans.jpeg' atau 'DANA_QRIS_Arexans.jpeg'
                // Karena ini adalah file JS umum, kita bisa mengambil dari atribut data-download-name di img
                link.download = qrisImage.dataset.downloadName || 'QRIS_Arexans.jpeg'; 
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Failed to download QRIS image:', error);
            }
        } else {
            console.error('Elemen gambar QRIS tidak ditemukan!');
        }
    };

    // Fungsi untuk mengunduh QRIS (untuk qris.html)
    window.downloadQrisImage = async function() { // Jadikan global agar bisa diakses dari HTML inline
        const qrisImage = document.getElementById('qrisCodeImage'); // ID berbeda di qris.html
        if (qrisImage) {
            const imageUrl = qrisImage.src;
            try {
                const response = await fetch(imageUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const imageBlob = await response.blob();
                const blobUrl = URL.createObjectURL(imageBlob);
                
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = qrisImage.dataset.downloadName || 'qris-solo-leveling.jpeg'; // Ambil dari data-download-name atau default
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(blobUrl);
            } catch (error) {
                console.error('Error downloading QRIS image:', error);
            }
        } else {
            console.error('QRIS image element not found!');
        }
    };
});
