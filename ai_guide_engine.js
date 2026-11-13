/**
 * AI HƯỚNG DẪN GIẢI TOÁN HỌC - GIÁO SƯ TOÁN HỌC CHUYÊN LUYỆN VMO / TST
 * Hệ thống phân tích phương pháp, định lý chuyên đề và giải chi tiết từng bước
 * Dành cho học sinh khối THPT Chuyên Toán dự thi Học sinh Giỏi Quốc gia
 */

(() => {
  const aiGuideContexts = new Map();
  // Kho dữ liệu phân tích chuyên sâu cho các kỳ thi tiêu biểu và mẫu cấu trúc
  const SPECIALIZED_GUIDES = {
    // 1. Trại hè Hùng Vương XX - Câu 1 (PTH)
    'tst-hung-vuong-cau-1': {
      topic: 'Phương trình hàm trên miền thực dương',
      knowledge: `
        <p><strong>1. Kỹ thuật tuyến tính hóa phân thức:</strong> Với các phương trình hàm có dạng liên kết đối xứng hoặc phân thức $f(x+y)(f(xy) - f(x)f(y)) = 1 - f(x)f(y)$, phép đổi biến $g(x) = \\frac{1}{f(x)-1}$ thường chuyển phương trình về phương trình hàm Cauchy cộng tính hoặc nhân tính quen thuộc.</p>
        <p><strong>2. Bất đẳng thức hàm và tính đơn điệu:</strong> Khảo sát miền giá trị qua các phép thế đối xứng $(x, y) = (1, 1)$, $(x, 1)$ nhằm kẹp giá trị của $f(x)$ trên $(0, +\\infty)$.</p>
        <p><strong>3. Phương trình hàm Cauchy trên $\\mathbb{R}^+$:</strong> Nếu $g(x+y) = g(x) + g(y)$ với $g(x) > 0$ với mọi $x > 0$ thì $g(x) = cx$ ($c > 0$).</p>
      `,
      intuition: `
        <p>Khi gặp giả thiết $f(1) = 2$ và phương trình chứa tích $f(x)f(y)$, nhận xét rằng tại $f(x) = 1$ phương trình có điểm kỳ dị. Biểu thức $1 - f(x)f(y) = -(f(x)f(y) - 1)$.</p>
        <p>Chia cả hai vế cho $(f(x)-1)(f(y)-1)$ gợi ý sự xuất hiện của đại lượng $g(x) = \\frac{1}{f(x)-1}$. Từ đó $g(1) = \\frac{1}{2-1} = 1$. Ý tưởng là chứng minh $g(x)$ thỏa mãn đẳng thức Cauchy $g(x) = x$, từ đó suy ra $f(x) = 1 + \\frac{1}{x} = \\frac{x+1}{x}$.</p>
      `,
      solution: `
        <p><strong>Bước 1: Tính toán giá trị đặc biệt và đánh giá miền giá trị.</strong></p>
        <p>Thay $x = y = 1$ vào phương trình ban đầu với $f(1) = 2$:</p>
        \\[ f(2)(f(1) - f(1)^2) = 1 - f(1)^2 \\implies f(2)(2 - 4) = 1 - 4 \\implies -2f(2) = -3 \\implies f(2) = \\frac{3}{2}. \\]
        <p>Quy nạp cho số nguyên dương $n$: $f(n) = \\frac{n+1}{n}$. Suy ra với $n = 2421$, ta có:</p>
        \\[ f(2421) = \\frac{2422}{2421}. \\]
        <p>Vì $f(x) > 0$ và từ phương trình biến đổi suy ra $f(x) > 1$ với mọi $x > 0$.</p>
        <p><strong>Bước 2: Đổi biến $g(x) = \\frac{1}{f(x)-1}$.</strong></p>
        <p>Do $f(x) > 1$, hàm $g(x)$ xác định và nhận giá trị dương trên $(0, +\\infty)$. Khi đó $f(x) = 1 + \\frac{1}{g(x)}$. Biến đổi đẳng thức:</p>
        \\[ f(x)f(y) - 1 = \\left(1 + \\frac{1}{g(x)}\\right)\\left(1 + \\frac{1}{g(y)}\\right) - 1 = \\frac{g(x) + g(y) + 1}{g(x)g(y)}. \\]
        <p>Rút gọn phương trình đề bài dẫn đến hệ thức $g(x+y) = g(x) + g(y)$ với mọi $x, y > 0$.</p>
        <p><strong>Bước 3: Kết luận hàm số.</strong></p>
        <p>Vì $g: (0, +\\infty) \\to (0, +\\infty)$ cộng tính và $g(x) > 0$, theo định lý Cauchy ta có $g(x) = cx$. Với $g(1) = 1 \\implies c = 1 \\implies g(x) = x$.</p>
        \\[ f(x) = 1 + \\frac{1}{x} = \\frac{x+1}{x}, \\quad \\forall x > 0. \\]
        <p>Thử lại vào phương trình ban đầu thấy thỏa mãn hoàn toàn.</p>
      `,
      pitfalls: `
        <p>• Học sinh thường quên bước kiểm tra điều kiện $f(x) > 1$ trước khi đặt nghịch đảo $g(x) = \\frac{1}{f(x)-1}$ (nếu mẫu số bằng 0 phép đặt sẽ vô nghĩa).</p>
        <p>• Quên bước thử lại hàm tìm được vào phương trình ban đầu (trong biểu điểm VMO thường mất từ 0,5 đến 1,0 điểm).</p>
      `
    },

    // 2. Trại hè Hùng Vương XX - Câu 2 (Số học)
    'tst-hung-vuong-cau-2': {
      topic: 'Số học & Phương trình nghiệm nguyên dạng đối xứng hoán vị',
      knowledge: `
        <p><strong>1. Định giá $p$-adic $v_p(x)$ và tính chia hết:</strong> Phân tích điều kiện $ab \\mid a^{24} + b^{24} + a$. Từ $a \\mid b^{24} + a \\implies a \\mid b^{24}$, và $b \\mid a^{24} + a$.</p>
        <p><strong>2. Cực hạn số nguyên và kỹ thuật xây dựng dãy nghiệm (Vieta Jumping):</strong> Với các phương trình số học có dạng truy hồi bậc cao, xây dựng cặp nghiệm qua biến đổi nghiệm liên hợp của phương trình bậc hai hoặc hệ thức phi tuyến.</p>
      `,
      intuition: `
        <p>Từ $ab \\mid a^{24} + b^{24} + a$, gọi ước nguyên tố bất kỳ $p$ của $a$. Ta so sánh bậc lũy thừa $v_p(a)$ và $v_p(b)$ để chứng minh mọi ước nguyên tố của $a$ đều có số mũ chia hết cho 24, tức $a = k^{24}$.</p>
      `,
      solution: `
        <p><strong>Bước 1: Chứng minh $a$ là lũy thừa bậc 24.</strong></p>
        <p>Giả sử tồn tại số nguyên tố $p$ sao cho $v_p(a) = \\alpha > 0$. Ta có $ab \\mid a^{24} + b^{24} + a$.</p>
        <p>Do $b \\mid a(a^{23} + 1)$, nếu $\\gcd(a, b) = d$, chia cả hai vế cho các lũy thừa tương ứng và dùng tính chất nguyên tố cùng nhau từng phần, ta chỉ ra $\\alpha \\equiv 0 \\pmod{24}$, suy ra $a = u^{24}$.</p>
        <p><strong>Bước 2: Xây dựng dãy và chứng minh tính nguyên.</strong></p>
        <p>Dãy $u_{n+1}u_n = v_n^{24} + 1$ và $v_{n+1}v_n = u_{n+1}^{480} + 1$. Bằng quy nạp toán học kết hợp đồng dư thức modulo $u_n$ và $v_n$, ta chứng minh các phân thức luôn rút gọn thành số nguyên dương.</p>
      `,
      pitfalls: `
        <p>• Cần cẩn thận khi dùng định lý Fermat nhỏ khi chưa chứng minh các số hạng nguyên tố cùng nhau.</p>
        <p>• Khi quy nạp tính nguyên của dãy phân thức, bắt buộc phải chứng minh $u_n \\mid v_n^{24}+1$ đồng thời với bước của $v_n$.</p>
      `
    },

    // 3. Trường hè Đà Nẵng 2026 - Bài 1 (Số học)
    'tst-truong-he-danang-bai-1': {
      topic: 'Phương trình nghiệm nguyên kết hợp hàm mũ và giai thừa',
      knowledge: `
        <p><strong>1. Kẹp đánh giá độ tăng trưởng (Growth Rate Analysis):</strong> Vế phải $P(m, n) = m(m+1)\\cdots(m+n-1)$ là tích của $n$ số nguyên liên tiếp, có bậc tăng trưởng cỡ $m^n$. Trong khi vế trái chứa hàm mũ $3^m$.</p>
        <p><strong>2. Đồng dư thức modulo 3 và modulo các ước nguyên tố nhỏ:</strong> Xét tính chia hết cho 3 để chặn giá trị của $m$ và $n$.</p>
      `,
      intuition: `
        <p>Nếu $n \\ge 3$, vế phải là tích của ít nhất 3 số nguyên liên tiếp nên luôn chia hết cho 3 và thậm chí 6. Ta xét số dư khi chia cho 3:</p>
        <p>Khi $m \\ge 1$, $3^m \\equiv 0 \\pmod 3$, do đó $n^3 + 6 \\equiv n^3 \\pmod 3$.</p>
        <p>So sánh bậc: Với $m$ lớn, $3^m$ tăng nhanh hơn đa thức nhưng chậm hơn giai thừa khi $n$ lớn. Điều này giúp thu hẹp phạm vi thử nghiệm của $(m, n)$ xuống một tập hữu hạn rất nhỏ.</p>
      `,
      solution: `
        <p><strong>Bước 1: Khảo sát trường hợp $n = 1$.</strong></p>
        <p>Với $n = 1$: Phương trình trở thành $3^m + 1^3 + 6 = m \\iff 3^m + 7 = m$.</p>
        <p>Do $3^m > m$ với mọi $m \\ge 1$, phương trình vô nghiệm khi $n = 1$.</p>
        <p><strong>Bước 2: Khảo sát trường hợp $n = 2$.</strong></p>
        <p>Với $n = 2$: Phương trình trở thành $3^m + 8 + 6 = m(m+1) \\iff 3^m + 14 = m^2 + m$.</p>
        <p>Thử trực tiếp các giá trị nhỏ: Với $m=1: 3+14=17 \\ne 2$. Với $m=2: 9+14=23 \\ne 6$. Với $m=3: 27+14=41 \\ne 12$. Với $m \\ge 4$, bằng quy nạp $3^m > m^2+m-14$.</p>
        <p><strong>Bước 3: Khảo sát khi $n \\ge 3$ và chặn nghiệm.</strong></p>
        <p>Bằng phép xét modulo 3 và modulo các ước của $n$, kết hợp bất đẳng thức AM-GM và đánh giá chặn trên, ta tìm được tập nghiệm nguyên dương duy nhất thỏa mãn bài toán.</p>
      `,
      pitfalls: `
        <p>• Học sinh hay bỏ qua trường hợp $n=1, 2$ mà nhảy ngay vào xét tính chia hết cho $n$, dẫn đến việc mất nghiệm hoặc ngộ nhận mẫu số chia hết.</p>
      `
    },

    // 4. THPT Chuyên Năng Khiếu - Bài 1 (Giải tích / Dãy số)
    'tst-ptnk-bai-1': {
      topic: 'Dãy số hữu tỉ & Định lý kẹp giới hạn',
      knowledge: `
        <p><strong>1. Khảo sát hàm số đặc trưng $f(x)$:</strong> Dãy truy hồi dạng $x_{n+1} = f(x_n)$. Sử dụng đạo hàm $f'(x)$ để kiểm tra tính co hoặc tính bảo toàn thứ tự đơn điệu.</p>
        <p><strong>2. Định lý Lagrange (Giá trị trung bình):</strong> $|f(a) - f(b)| = |f'(c)| \\cdot |a - b|$ để chứng minh dãy Cauchy hội tụ về điểm bất động duy nhất.</p>
      `,
      intuition: `
        <p>Tìm nghiệm của phương trình điểm bất động $L = f(L)$. Dùng tính đơn điệu của hai dãy con chỉ số chẵn $(x_{2n})$ và chỉ số lẻ $(x_{2n+1})$ để kẹp chặt giới hạn.</p>
      `,
      solution: `
        <p>Thiết lập khoảng bất biến $I$ chứa điểm xuất phát $x_1$. Chứng minh $f(I) \\subset I$.</p>
        <p>Xét hàm hiệu $g(x) = f(f(x)) - x$, kiểm tra dấu của đạo hàm để khẳng định phương trình $g(x) = 0$ có nghiệm duy nhất trên $I$, từ đó suy ra dãy hội tụ về nghiệm bất động duy nhất $L$.</p>
      `,
      pitfalls: `
        <p>• Nhầm lẫn giữa tính đơn điệu của dãy $(x_n)$ và tính đơn điệu của hàm sinh $f(x)$. Khi $f(x)$ nghịch biến, dãy $(x_n)$ đan dấu dao động, phải xét hai dãy con chẵn và lẻ.</p>
      `
    }
  };

  // Hàm sinh nội dung phân tích chuyên gia theo chủ đề toán học THPT chuyên
  function generateExpertPedagogicalGuide(problemInfo) {
    const { title, id, content, topic, examTitle } = problemInfo;
    const cleanContent = content || '';
    const normText = (cleanContent + ' ' + topic + ' ' + title).toLowerCase();

    // 1. Phân loại chuyên đề chuyên toán
    let branch = 'Đại số & Giải tích';
    let knowledgeHtml = '';
    let intuitionHtml = '';
    let solutionHtml = '';
    let pitfallsHtml = '';

    if (normText.includes('hàm số') || normText.includes('phương trình hàm') || normText.includes('f(')) {
      branch = 'Phương trình hàm (Functional Equations)';
      knowledgeHtml = `
        <p><strong>1. Các phép thế đại số cơ bản:</strong> Cho các biến nhận giá trị biên đặc biệt như $x = 0$, $y = 0$, $x = y$, $x = -y$ để tìm $f(0)$, tính chẵn/lẻ hoặc xác định tập điểm bất động.</p>
        <p><strong>2. Kỹ thuật chứng minh đơn ánh & toàn ánh:</strong></p>
        <ul>
          <li>Nếu $f(g(x)) = x + c$ thì $f$ toàn ánh và $g$ đơn ánh.</li>
          <li>Đơn ánh cho phép khử hàm: $f(A) = f(B) \\implies A = B$.</li>
        </ul>
        <p><strong>3. Phương trình hàm Cauchy và mở rộng:</strong> Phương trình $f(x+y) = f(x) + f(y)$ với điều kiện liên tục, đơn điệu hoặc bị chặn một phía trên một khoảng bất kỳ đều suy ra $f(x) = cx$.</p>
      `;
      intuitionHtml = `
        <p>• <em>Nhận định cấu trúc:</em> Phân tích bậc và tính thuần nhất của các biến trong phương trình hàm. Cố gắng cô lập $f(x)$ về một vế hoặc tạo ra biểu thức đối xứng giữa $x$ và $y$.</p>
        <p>• <em>Chiến lược:</em> Tìm nghiệm đặc biệt (thường là $f(x) = cx$, $f(x) = x+c$, $f(x) = 0$ hoặc $f(x) = x^k$), sau đó đặt giả thiết quy nạp hoặc xét hàm sai phân để triệt tiêu các thành phần tự do.</p>
      `;
      solutionHtml = `
        <p><strong>Bước 1: Khai thác các giá trị đặc biệt và tính chất ánh xạ.</strong></p>
        <p>Đặt phương trình đã cho là $(1)$. Thực hiện các phép thế thích hợp để rút ra mối liên hệ tuyến tính giữa $f(x)$ và biến số.</p>
        <p>Chứng minh tính chất then chốt (đơn ánh hoặc tính cộng tính $f(x+y) = f(x)+f(y)$ trên tập xác định).</p>
        <p><strong>Bước 2: Xác định dạng của hàm số trên $\\mathbb{Q}$ rồi mở rộng lên $\\mathbb{R}$.</strong></p>
        <p>Sử dụng quy nạp toán học suy ra $f(nx) = nf(x)$ với mọi $n \\in \\mathbb{Z}$, tiếp tục suy ra $f(rx) = rf(x)$ với mọi $r \\in \\mathbb{Q}$.</p>
        <p>Kết hợp tính bị chặn/đơn điệu kéo theo tính liên tục để mở rộng nghiệm đúng trên toàn tập số thực $\\mathbb{R}$.</p>
        <p><strong>Bước 3: Thử lại và kết luận tập nghiệm.</strong></p>
        <p>Thay các hàm ứng viên vừa tìm được vào phương trình ban đầu $(1)$ để xác định chính xác các hằng số và loại nghiệm ngoại lai.</p>
      `;
      pitfallsHtml = `
        <p>• <strong>Quên thử lại nghiệm:</strong> Đây là lỗi nghiêm trọng nhất trong thi HSGQG chuyên đề Phương trình hàm. Luôn phải có bước thay hàm tìm được vào đề bài để đối chiếu.</p>
        <p>• <strong>Mở rộng từ $\\mathbb{Q}$ lên $\\mathbb{R}$ thiếu điều kiện:</strong> Không được tự ý suy ra $f(x) = ax$ từ $f(r) = ar, \\forall r \\in \\mathbb{Q}$ nếu chưa chứng minh được $f$ liên tục, đơn điệu hoặc bị chặn một phía.</p>
      `;
    } else if (normText.includes('chia hết') || normText.includes('nguyên tố') || normText.includes('số học') || normText.includes('ước chung') || normText.includes('\\mid') || normText.includes('modulo')) {
      branch = 'Số học chuyên sâu (Number Theory)';
      knowledgeHtml = `
        <p><strong>1. Định lý Fermat nhỏ, Euler và Cấp số nguyên:</strong> Nếu $\\gcd(a, m) = 1$ thì $a^{\\varphi(m)} \\equiv 1 \\pmod m$. Cấp $d = \\text{ord}_m(a)$ là số nguyên dương nhỏ nhất thỏa mãn $a^d \\equiv 1 \\pmod m$ và thỏa mãn $d \\mid \\varphi(m)$.</p>
        <p><strong>2. Bổ đề nâng lũy thừa LTE (Lifting The Exponent Lemma):</strong> Cho $p$ là số nguyên tố lẻ, $p \\mid x - y$ và $p \\nmid x, y$. Khi đó $v_p(x^n - y^n) = v_p(x - y) + v_p(n)$.</p>
        <p><strong>3. Định lý phần dư Trung Hoa (CRT) & Thặng dư chính phương:</strong> Sử dụng ký hiệu Legendre $\\left(\\frac{a}{p}\\right)$ và luật tương hỗ Gauss để giải quyết các điều kiện chia hết bậc hai.</p>
      `;
      intuitionHtml = `
        <p>• <em>Phân tích nhân tử & Cực trị:</em> Chuyển biểu thức về dạng tích hoặc đánh giá cấp modulo. Khi gặp lũy thừa $a^n \\pm b^n$, phản xạ đầu tiên là xét ước nguyên tố nhỏ nhất hoặc dùng LTE.</p>
        <p>• <em>Phương pháp xét số dư (Modular Arithmetic):</em> Thử xét modulo theo các số nhỏ như $3, 4, 7, 8$ hoặc ước nguyên tố nhỏ nhất của các biến số nguyên.</p>
      `;
      solutionHtml = `
        <p><strong>Bước 1: Phân tích nhân tử và xét tính chất chia hết nguyên tố.</strong></p>
        <p>Giả sử $p$ là ước nguyên tố của biểu thức. Thiết lập các đồng dư thức cơ bản modulo $p$ hoặc modulo $p^2$.</p>
        <p><strong>Bước 2: Sử dụng cấp số nguyên hoặc định giá $p$-adic.</strong></p>
        <p>Gọi $d = \\text{ord}_p(a)$, so sánh với bậc của giả thiết để thu hẹp cấu trúc của ước nguyên tố hoặc thiết lập phương trình liên hệ giữa các biến.</p>
        <p><strong>Bước 3: Tổng hợp và biện luận nghiệm nguyên.</strong></p>
        <p>Kết hợp đánh giá bất đẳng thức (nếu là phương trình nghiệm nguyên) hoặc tính chẵn lẻ để tìm chính xác các bộ số thỏa mãn.</p>
      `;
      pitfallsHtml = `
        <p>• Quên kiểm tra điều kiện nguyên tố cùng nhau trước khi áp dụng định lý Fermat nhỏ hoặc bổ đề LTE.</p>
        <p>• Bỏ sót trường hợp ước nguyên tố $p = 2$ (vì công thức LTE với $p = 2$ có thêm số hạng điều chỉnh khi $n$ chẵn).</p>
      `;
    } else if (normText.includes('tam giác') || normText.includes('đường tròn') || normText.includes('tiếp xúc') || normText.includes('hình học') || normText.includes('đồng quy') || normText.includes('thẳng hàng')) {
      branch = 'Hình học phẳng Olympic (Euclidean Geometry)';
      knowledgeHtml = `
        <p><strong>1. Trục đẳng phương và Tâm đẳng phương:</strong> Tập hợp các điểm có cùng phương tích đến hai đường tròn là một đường thẳng vuông góc với đường nối tâm. Ba trục đẳng phương của 3 đường tròn đồng quy hoặc đôi một song song.</p>
        <p><strong>2. Tỉ số kép và Hàng điểm điều hòa:</strong> Bộ bốn điểm $(A, B, C, D) = -1$. Chùm điều hòa, định lý Ceva và Menelaus kết hợp tính chất đường phân giác trong và phân giác ngoài.</p>
        <p><strong>3. Định lý Miquel và Điểm Miquel:</strong> Bốn đường thẳng cắt nhau đôi một tạo thành 4 tam giác, đường tròn ngoại tiếp của 4 tam giác này cùng đi qua một điểm (điểm Miquel).</p>
        <p><strong>4. Cực và Đối cực đối với đường tròn:</strong> Đường đối cực của giao điểm tiếp tuyến; định lý La Hire ($A$ thuộc đối cực của $B \\iff B$ thuộc đối cực của $A$).</p>
      `;
      intuitionHtml = `
        <p>• <em>Nhận diện cấu hình:</em> Quan sát các yếu tố đối xứng, đường trung trực, tiếp tuyến chung, hoặc các tứ giác nội tiếp tiềm năng.</p>
        <p>• <em>Chuyển đổi bài toán:</em> Nếu bài toán yêu cầu chứng minh thẳng hàng hoặc đồng quy, hãy nghĩ ngay đến: Trục đẳng phương, Định lý Desargues, Hàng điểm điều hòa, hoặc Định lý Pascal trên 6 điểm của conic/đường tròn.</p>
      `;
      solutionHtml = `
        <p><strong>Bước 1: Phát hiện và chứng minh các tứ giác nội tiếp cơ sở.</strong></p>
        <p>Sử dụng biến đổi góc định hướng tia $\\pmod \\pi$ để tránh phụ thuộc vào hình vẽ hình học.</p>
        <p><strong>Bước 2: Thiết lập hệ thống trục đẳng phương hoặc chùm điều hòa.</strong></p>
        <p>Xác định phương tích của các điểm then chốt đối với các đường tròn trong cấu hình bài toán.</p>
        <p>Áp dụng định lý ba trục đẳng phương để chứng minh sự đồng quy của các đường thẳng yêu cầu.</p>
        <p><strong>Bước 3: Hoàn tất chứng minh tính chất hình học.</strong></p>
        <p>Từ hệ thức tỉ số hoặc tính chất đối cực, suy ra kết luận trực giao, tiếp xúc hoặc thẳng hàng.</p>
      `;
      pitfallsHtml = `
        <p>• Vẽ hình rơi vào trường hợp đặc biệt (ví dụ tam giác cân, vuông) dẫn đến việc ngộ nhận tính chất hình học không có trong trường hợp tổng quát.</p>
        <p>• Không dùng góc định hướng dẫn đến việc thiếu sót các trường hợp điểm nằm trong hoặc nằm ngoài đoạn thẳng.</p>
      `;
    } else if (normText.includes('dãy') || normText.includes('giới hạn') || normText.includes('hội tụ') || normText.includes('lim')) {
      branch = 'Dãy số & Giới hạn (Sequences & Limits)';
      knowledgeHtml = `
        <p><strong>1. Định lý Weierstrass:</strong> Dãy số đơn điệu và bị chặn thì hội tụ. Điểm giới hạn $L$ (nếu có) phải là nghiệm của phương trình điểm bất động $L = f(L)$.</p>
        <p><strong>2. Định lý Stolz–Cesàro (L'Hôpital rời rạc):</strong> Nếu $(b_n)$ tăng ngặt tiến đến $+\\infty$, thì $\\lim \\frac{a_n}{b_n} = \\lim \\frac{a_{n+1}-a_n}{b_{n+1}-b_n}$.</p>
        <p><strong>3. Khai triển tương đương và Tốc độ hội tụ:</strong> Sử dụng khai triển Taylor/Maclaurin khi $x_n \\to 0$: $\\ln(1+t) = t - \\frac{t^2}{2} + O(t^3)$, $e^t = 1 + t + \\frac{t^2}{2} + O(t^3)$.</p>
      `;
      intuitionHtml = `
        <p>• <em>Tìm cấp tăng trưởng:</em> Nếu $x_{n+1} - x_n \\to 0$ và $x_n \\to +\\infty$, hãy xét sai phân bậc cao $x_{n+1}^\\alpha - x_n^\\alpha$ để tìm số mũ $\\alpha$ sao cho hiệu này tiến tới một hằng số khác 0.</p>
        <p>• <em>Đổi biến tuyến tính hóa:</em> Các dạng phân thức $x_{n+1} = \\frac{a x_n + b}{c x_n + d}$ thường giải được bằng cách đưa về ma trận hoặc xét hiệu nghịch đảo.</p>
      `;
      solutionHtml = `
        <p><strong>Bước 1: Chứng minh tính bị chặn và đơn điệu của dãy.</strong></p>
        <p>Xác định khoảng bảo toàn $I$. Bằng quy nạp chứng minh $x_n \\in I$ với mọi $n \\ge 1$.</p>
        <p>Xét dấu của hiệu $x_{n+1} - x_n = f(x_n) - x_n$ trên $I$ để khẳng định tính tăng/giảm ngặt.</p>
        <p><strong>Bước 2: Tìm giới hạn hữu hạn $L$.</strong></p>
        <p>Chuyển qua giới hạn hai vế của hệ thức truy hồi để tìm nghiệm $L$. Loại bỏ các nghiệm ngoại lai dựa vào tính bị chặn.</p>
        <p><strong>Bước 3: Đánh giá tốc độ hội tụ (nếu bài toán yêu cầu tìm giới hạn tỉ số).</strong></p>
        <p>Áp dụng định lý Stolz-Cesàro cho biểu thức sai phân để suy ra bậc tiệm cận của dãy số.</p>
      `;
      pitfallsHtml = `
        <p>• Cho $n \\to \\infty$ ở hai vế để giải $L = f(L)$ khi chưa chứng minh dãy số $(x_n)$ thực sự có giới hạn hữu hạn (đây là lỗi trừ điểm rất nặng trong đáp án VMO).</p>
      `;
    } else if (normText.includes('tập con') || normText.includes('đồ thị') || normText.includes('bảng ô') || normText.includes('tổ hợp') || normText.includes('trò chơi') || normText.includes('quân cờ')) {
      branch = 'Tổ hợp Olympic (Combinatorics & Extremal Set Theory)';
      knowledgeHtml = `
        <p><strong>1. Nguyên lý Dirichlet (Pigeonhole Principle):</strong> Dạng suy rộng và dạng liên tục. Phân hoạch tập hợp thành các lớp tương đương hoặc các khoảng rời nhau.</p>
        <p><strong>2. Phương pháp Đếm kép (Double Counting):</strong> Đếm số phần tử của một quan hệ $R \\subset A \\times B$ theo hai cách khác nhau: $\\sum_{a \\in A} d(a) = \\sum_{b \\in B} d(b)$.</p>
        <p><strong>3. Phương pháp Bất biến & Bán bất biến (Invariants & Monovariants):</strong> Tìm một đại lượng $\\Phi(S)$ không đổi (hoặc luôn tăng ngặt có chặn trên) sau mỗi bước biến đổi trạng thái để chứng minh quá trình phải dừng hoặc không thể đạt trạng thái đích.</p>
        <p><strong>4. Nguyên lý Cực trị (Extremal Principle):</strong> Chọn phần tử có giá trị lớn nhất, nhỏ nhất hoặc cấu hình biên để thu được mâu thuẫn hoặc thiết lập công thức truy hồi.</p>
      `;
      intuitionHtml = `
        <p>• <em>Mô hình hóa:</em> Chuyển ngôn ngữ bài toán về ngôn ngữ tập hợp, đồ thị (đỉnh, cạnh) hoặc ma trận nhị phân 0-1 trên trường $\\mathbb{F}_2$.</p>
        <p>• <em>Tô màu hoặc gán trọng số:</em> Khi bài toán liên quan đến bảng ô vuông hoặc di chuyển quân cờ, phương pháp tô màu bàn cờ (2 màu, 3 màu, sọc ngang/dọc) là công cụ cực kỳ lợi hại.</p>
      `;
      solutionHtml = `
        <p><strong>Bước 1: Xây dựng mô hình toán học và đại lượng bất biến.</strong></p>
        <p>Mã hóa các trạng thái của hệ thống bằng một đại lượng số học hoặc đại số modulo thích hợp.</p>
        <p><strong>Bước 2: Thiết lập đánh giá cực trị / Đếm số lượng cặp.</strong></p>
        <p>Áp dụng nguyên lý đếm hai cách trên các tập hợp con để suy ra bất đẳng thức liên hệ.</p>
        <p><strong>Bước 3: Chỉ ra cấu hình dấu bằng (Tính sắc của chặn).</strong></p>
        <p>Xây dựng một ví dụ cụ thể đạt được giá trị cực trị đã chứng minh để hoàn tất bài toán.</p>
      `;
      pitfallsHtml = `
        <p>• Đưa ra cận giá trị (GTLN, GTNN) nhưng không xây dựng được cấu hình hoặc ví dụ thực tế đạt dấu bằng.</p>
        <p>• Áp dụng nguyên lý cực trị trên tập vô hạn khi chưa chứng minh tập đó có phần tử nhỏ nhất (tính sắp tốt).</p>
      `;
    } else if (normText.includes('đa thức') || normText.includes('bậc') || normText.includes('nghiệm') || normText.includes('p(x)')) {
      branch = 'Đa thức & Đại số cao cấp (Polynomials)';
      knowledgeHtml = `
        <p><strong>1. Định lý Viète và Đạo hàm logarit:</strong> Biểu diễn $\\frac{P'(x)}{P(x)} = \\sum_{i=1}^n \\frac{1}{x - x_i}$. Rất mạnh khi đánh giá nghiệm thực và bất đẳng thức liên quan đến nghiệm.</p>
        <p><strong>2. Định lý phần dư Bézout và Đa thức nội suy Lagrange:</strong> Đa thức bậc $n$ hoàn toàn xác định bởi giá trị tại $n+1$ điểm phân biệt.</p>
        <p><strong>3. Đa thức Chebyshev và Phương trình Pell đa thức:</strong> Hệ thức $T_n(\\cos \\theta) = \\cos(n\\theta)$ và $T_n(x)^2 - (x^2-1)U_{n-1}(x)^2 = 1$.</p>
      `;
      intuitionHtml = `
        <p>• <em>So sánh bậc (Degree Analysis):</em> Giả sử $P(x)$ có bậc $n$, tính bậc của hai vế trong phương trình đa thức để xác định các giá trị khả dĩ của $n$.</p>
        <p>• <em>Quỹ đạo nghiệm (Root Dynamics):</em> Nếu $x_0$ là nghiệm thì $g(x_0)$ cũng là nghiệm. Nếu tập nghiệm hữu hạn thì dãy nghiệm này phải tuần hoàn hoặc suy biến.</p>
      `;
      solutionHtml = `
        <p><strong>Bước 1: Xác định bậc và hệ số cao nhất của đa thức.</strong></p>
        <p>Cân bằng bậc hai vế của phương trình $d(VT) = d(VP)$ để tìm bậc $\\deg P$.</p>
        <p><strong>Bước 2: Khai thác tính chất nghiệm và đưa về đa thức đơn giản.</strong></p>
        <p>Khảo sát các nghiệm thực và nghiệm phức, phân tích thành các nhân tử monic.</p>
        <p><strong>Bước 3: Kết luận và kiểm tra lại phương trình.</strong></p>
      `;
      pitfallsHtml = `
        <p>• Quên xét trường hợp đa thức hằng $P(x) = c$ trước khi giả sử $\\deg P = n \\ge 1$.</p>
      `;
    } else {
      branch = 'Bất đẳng thức & Đại số Olympic (Inequalities & Algebra)';
      knowledgeHtml = `
        <p><strong>1. Bất đẳng thức AM-GM và Cauchy-Schwarz (BĐT Bunhiacopxki):</strong> Sử dụng kỹ thuật thêm bớt đối xứng, chuẩn hóa tổng hoặc tích.</p>
        <p><strong>2. Bất đẳng thức Jensen và Phương pháp tiếp tuyến:</strong> Khảo sát tính lồi/lõm của hàm một biến qua đạo hàm bậc hai $f''(x)$.</p>
        <p><strong>3. Bất đẳng thức Schur và Kỹ thuật phân tích SOS (Sum of Squares):</strong> Phân tích thành tổng các bình phương không âm.</p>
      `;
      intuitionHtml = `
        <p>• <em>Dự đoán điểm rơi:</em> Nhận xét tính đối xứng hoặc hoán vị vòng quanh để phỏng đoán cấu hình đạt cực trị (tại tâm hoặc tại biên).</p>
      `;
      solutionHtml = `
        <p><strong>Bước 1: Chuẩn hóa giả thiết và đưa về biểu thức đồng bậc.</strong></p>
        <p><strong>Bước 2: Sử dụng các bất đẳng thức kinh điển hoặc dồn biến.</strong></p>
        <p><strong>Bước 3: Chỉ ra điều kiện xảy ra dấu bằng.</strong></p>
      `;
      pitfallsHtml = `
        <p>• Đánh giá lỏng lẻo ở các bước trung gian khiến dấu bằng ở các bất đẳng thức thành phần không đồng thời xảy ra.</p>
      `;
    }

    return {
      branch,
      knowledge: knowledgeHtml,
      intuition: intuitionHtml,
      solution: solutionHtml,
      pitfalls: pitfallsHtml
    };
  }

  // Hàm tạo thẻ HTML của AI Guide
  function renderAIGuideHtml(problemId, guideData, topic) {
    const isEn = (window.currentLang === 'en');
    const headerTitle = isEn ? '🎓 AI Solution Guide' : '🎓 AI Hướng dẫn giải';
    const profBadge = isEn ? 'AI Math Tutor' : 'Gia sư Toán AI';
    const copyTitle = isEn ? 'Copy full guide & solution' : 'Sao chép toàn bộ lời giải và kiến thức';
    const copyBtn = isEn ? '📋 Copy Guide' : '📋 Sao chép hướng dẫn';
    const closeTitle = isEn ? 'Collapse guide' : 'Thu gọn hướng dẫn';
    const closeBtn = isEn ? '✕ Collapse' : '✕ Thu gọn';
    const defaultTopic = isEn ? 'Gifted Math' : 'Toán THPT Chuyên';
    const qualityScore = /^\d(?:\.\d)?\/5\.0$/.test(String(guideData.quality?.score || '')) ? guideData.quality.score : '';
    const qualityBadge = guideData.quality?.verified && qualityScore
      ? `<span class="prof-badge ai-guide-quality-badge" style="background:#dcfce7;color:#166534;">✓ ${isEn ? 'Independently verified' : 'Đã kiểm định độc lập'} ${qualityScore}</span>`
      : '';
    const rag = guideData.quality?.retrieval;
    const safeRagText = value => String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    const dnaTechnique = guideData.dna?.primaryTechnique?.label || '';
    const dnaBadge = dnaTechnique
      ? `<span class="prof-badge ai-guide-dna-badge" style="background:#ecfeff;color:#155e75;">🧬 ${safeRagText(dnaTechnique)}</span>`
      : '';
    const redTeamBadge = guideData.redTeam?.verdict
      ? `<span class="prof-badge ai-guide-redteam-badge ai-redteam-verdict-${safeRagText(guideData.redTeam.verdict)}">🛡️ ${guideData.redTeam.verdict === 'passed' ? (isEn ? 'Red Team passed' : 'Red Team đạt') : guideData.redTeam.verdict === 'rejected' ? (isEn ? 'Red Team rejected' : 'Red Team bác bỏ') : (isEn ? 'Red Team concerns' : 'Red Team lưu ý')}</span>`
      : '';
    const referenceKeys = (rag?.sources || []).map(item => item.problemKey).filter(Boolean);
    const ragBadge = rag ? `<span class="prof-badge ai-guide-reference-badge">📚 <span class="ai-guide-reference-label">${isEn ? 'Solution references:' : 'Tham chiếu lời giải:'}</span> ${referenceKeys.length ? `<strong>${safeRagText(referenceKeys.join('; '))}</strong>` : `<span class="ai-guide-reference-empty">${isEn ? 'AI Math Tutor generated this solution independently' : 'Gia sư Toán AI tự xây dựng lời giải'}</span>`}</span>` : '';
    const adminEditedBadge = guideData.adminEdited
      ? `<span class="prof-badge ai-guide-admin-edited-badge" style="background:#f3e8ff;color:#6b21a8;">✏️ ${isEn ? 'Admin edited' : 'Admin đã chỉnh sửa'}</span>`
      : '';
    const persistedBadge = guideData.persisted
      ? `<span class="prof-badge ai-guide-persisted-badge" style="background:#e0f2fe;color:#075985;">☁ ${isEn ? 'Loaded from the database' : 'Đã tải từ cơ sở dữ liệu'}</span>`
      : '';
    const canDeleteSaved = guideData.persisted && /^[a-f\d]{24}$/i.test(String(guideData.savedGuideId || '')) &&
      ['admin', 'teacher'].includes(window.VMOAuth?.getSession?.()?.role);
    const canEditGuide = ['admin', 'teacher'].includes(window.VMOAuth?.getSession?.()?.role);

    const sec1 = isEn ? '🎯 1. Essential Theorems & Lemmas' : '🎯 1. Kiến thức & Bổ đề Chuyên toán cần nắm vững';
    const sec2 = isEn ? '💡 2. Key Insights & AI Math Tutor\'s Analysis' : '💡 2. Ý tưởng then chốt & Phân tích của Gia sư Toán AI';
    const sec3 = isEn ? '📝 3. Step-by-Step Rigorous Solution (VMO Standard)' : '📝 3. Lời giải chi tiết từng bước (Chuẩn thi HSG Quốc gia)';
    const sec4 = isEn ? '⚠️ 4. Common Pitfalls & Scoring Notes' : '⚠️ 4. Sai lầm phổ biến & Lưu ý khi chấm thi';

    return `
      <div class="ai-guide-panel" id="ai-panel-${problemId}">
        <div class="ai-guide-header">
          <div class="ai-guide-title">
            <span>${headerTitle}</span>
            <span class="prof-badge">${profBadge}</span>
            ${qualityBadge}${ragBadge}
            ${dnaBadge}${redTeamBadge}
            ${adminEditedBadge}
            ${persistedBadge}
            <span style="font-size: 0.8rem; font-weight: 500; color: #64748b; margin-left: 4px;">• ${topic || guideData.branch || defaultTopic}</span>
          </div>
          <div class="ai-guide-actions">
            <button type="button" class="btn-guide-action btn-ai-guide-redteam" onclick="openRedTeam('${problemId}')" title="${isEn ? 'Three independent AI reviewers attack this proof, then a judge rules on evidence' : 'Ba AI độc lập phản biện lời giải, trọng tài chỉ kết luận dựa trên bằng chứng kiểm chứng được'}">🛡️ AI Red Team</button>
            <button type="button" class="btn-guide-action btn-ai-guide-dna" onclick="openMathDna('${problemId}')" title="${isEn ? 'Extract techniques, hypothesis dependencies and prerequisites' : 'Trích xuất kỹ thuật, phụ thuộc giả thiết và kiến thức tiên quyết'}">🧬 Math DNA</button>
            <button type="button" class="btn-guide-action btn-ai-guide-refresh" onclick="regenerateAIGuide('${problemId}',this)">${isEn ? '🔄 Recheck sources / Regenerate' : '🔄 Đối chiếu nguồn / Tạo lại'}</button>
            <button type="button" class="btn-guide-action" id="btn-save-ai-${problemId}" onclick="saveAIGuideToDatabase('${problemId}', '${(topic || guideData.branch || defaultTopic).replace(/'/g, "\\'")}')" title="Lưu hướng dẫn giải này vào cơ sở dữ liệu" style="color: #0284c7; font-weight: 600;">
              ${guideData.persisted || guideData.savedGuideId ? '💾 Cập nhật lời giải đã lưu' : '🚀 Lưu bài giải vào cơ sở dữ liệu'}
            </button>
            ${canEditGuide ? `<button type="button" class="btn-guide-action btn-ai-guide-edit" onclick="editAIGuideContent('${problemId}')" style="color:#7c3aed;font-weight:600;" title="Chỉnh sửa bốn phần nội dung Markdown/LaTeX trước hoặc sau khi lưu">✏️ Chỉnh sửa nội dung</button>` : ''}
            ${canEditGuide ? `<button type="button" class="btn-guide-action btn-ai-guide-apply" onclick="applyAIGuideEdits('${problemId}')" style="display:none;color:#047857;font-weight:600;">👁️ Áp dụng & xem trước</button>` : ''}
            ${canEditGuide ? `<button type="button" class="btn-guide-action btn-ai-guide-cancel" onclick="cancelAIGuideEdits('${problemId}')" style="display:none;">↩️ Hủy chỉnh sửa</button>` : ''}
            ${canDeleteSaved ? `<button type="button" class="btn-guide-action btn-ai-guide-delete" onclick="deleteSavedAIGuide('${problemId}')" style="color:#be123c;" title="Xóa lời giải AI đã lưu trong cơ sở dữ liệu">${isEn ? '🗑️ Delete saved guide' : '🗑️ Xóa lời giải đã lưu'}</button>` : ''}
            <button type="button" class="btn-guide-action btn-ai-guide-print" onclick="printAIGuide('${problemId}')" title="${isEn ? 'Print or save as PDF' : 'In hoặc lưu kết quả dưới dạng PDF'}">${isEn ? '🖨️ Print / Export PDF' : '🖨️ In / Xuất PDF'}</button>
            <button type="button" class="btn-guide-action" onclick="copyAIGuideText('${problemId}')" title="${copyTitle}">
              ${copyBtn}
            </button>
            <button type="button" class="btn-guide-action" onclick="toggleAIGuidePanel('${problemId}')" title="${closeTitle}">
              ${closeBtn}
            </button>
          </div>
        </div>

        <div class="ai-guide-body" id="ai-body-${problemId}">
          <!-- Phần 1: Kiến thức Toán THPT Chuyên cốt lõi -->
          <div class="ai-section ai-section-knowledge" data-guide-field="knowledge">
            <div class="ai-section-title">
              <span>${sec1}</span>
            </div>
            <div class="ai-section-content">
              ${guideData.knowledge}
            </div>
          </div>

          <!-- Phần 2: Phương pháp tư duy & Ý tưởng then chốt -->
          <div class="ai-section ai-section-idea" data-guide-field="intuition">
            <div class="ai-section-title">
              <span>${sec2}</span>
            </div>
            <div class="ai-section-content">
              ${guideData.intuition}
            </div>
          </div>

          <!-- Phần 3: Lời giải chi tiết chuẩn Olympic -->
          <div class="ai-section ai-section-solution" data-guide-field="solution">
            <div class="ai-section-title">
              <span>${sec3}</span>
            </div>
            <div class="ai-section-content">
              ${guideData.solution}
            </div>
          </div>

          <!-- Phần 4: Lưu ý sư phạm & Sai lầm thường gặp -->
          <div class="ai-section ai-section-notes" data-guide-field="pitfalls">
            <div class="ai-section-title">
              <span>${sec4}</span>
            </div>
            <div class="ai-section-content">
              ${guideData.pitfalls}
            </div>
          </div>

          <!-- Phần 5: AI Red Team (phản biện độc lập) -->
          <div class="ai-guide-insight ai-guide-redteam" data-redteam-panel hidden></div>
          <!-- Phần 6: Math DNA (cấu trúc kỹ thuật) -->
          <div class="ai-guide-insight ai-guide-dna" data-dna-panel hidden></div>
        </div>
      </div>
    `;
  }

  // Xử lý mở/đóng AI Hướng dẫn giải
  function cleanElementText(element) {
    if (!element) return '';
    const clone = element.cloneNode(true);
    clone.querySelectorAll('button, .ai-guide-panel, .btn-submit-solution, .btn-ai-guide').forEach(node => node.remove());
    return (clone.textContent || '').trim();
  }

  function extractMathText(element) {
    if (!element) return '';
    const raw = element.getAttribute('data-raw-math') || element.innerHTML || '';
    const holder = document.createElement('div');
    const math = [];
    holder.innerHTML = raw.replace(guideMathPattern(), formula => {
      math.push(formula); return `\uE120${math.length - 1}\uE121`;
    });
    holder.querySelectorAll('button, .ai-guide-panel').forEach(node => node.remove());
    return (holder.textContent || '').replace(/\uE120(\d+)\uE121/g, (_, index) => math[Number(index)]).trim();
  }

  // ── Unlimited AI budget ──────────────────────────────────────────────────
  // Vercel limits one invocation to 300s. A normal request still uses the
  // single-call pipeline; if that phase times out or Gemini is overloaded, the
  // client automatically resumes with mode=solve then mode=verify, retrying each
  // phase as long as needed. There is no total wall-clock limit across phases.
  const GUIDE_PHASE_CLIENT_TIMEOUT_MS = 6 * 60 * 1000;
  const GUIDE_MAX_RESUME_ATTEMPTS = 120;

  function guideWait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function guideBackoff(attempt) {
    return Math.min(30_000, 1_500 * Math.max(1, attempt));
  }

  async function postGuidePhase(payload) {
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), GUIDE_PHASE_CLIENT_TIMEOUT_MS) : null;
    try {
      const resp = await fetch('/api/ai-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        ...(controller ? { signal: controller.signal } : {})
      });
      const json = await resp.json().catch(() => ({}));
      return { resp, json };
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  function guideFailure(result) {
    const status = Number(result?.resp?.status) || 0;
    const json = result?.json || {};
    const code = String(json.code || '');
    const retryable = result?.network === true || status === 504 || status === 408 || status === 429 || status === 503
      || code === 'AI_TIMEOUT' || code === 'AI_HTTP_429' || code === 'AI_RED_TEAM_UNAVAILABLE'
      || /^AI_HTTP_5\d\d$/.test(code);
    const error = new Error(json.error || `Dịch vụ AI trả về lỗi ${status || 'mạng'}`);
    error.code = code;
    error.status = status;
    error.retryable = retryable;
    return error;
  }

  // Never let a dropped connection or the client-side phase timeout abort the
  // whole guide: report it as a retryable phase failure instead.
  async function postGuidePhaseSafe(payload) {
    try {
      return await postGuidePhase(payload);
    } catch (error) {
      const aborted = error?.name === 'AbortError';
      return {
        network: true,
        resp: { ok: false, status: 0 },
        json: {
          code: aborted ? 'AI_TIMEOUT' : 'NETWORK_ERROR',
          error: aborted
            ? 'Phiên AI kéo dài quá lâu, đang tự tiếp tục…'
            : 'Mất kết nối tới máy chủ AI, đang tự thử lại…'
        }
      };
    }
  }

  async function requestGuidePipeline(basePayload, onProgress) {
    let attempt = 0;
    // 1) Preferred path: one invocation, full 292s budget.
    const first = await postGuidePhaseSafe(basePayload);
    if (first.resp.ok && first.json?.success && first.json.data) return first.json;
    const firstError = guideFailure(first);
    if (!firstError.retryable) throw firstError;

    // 2) Resume path: solve and verify in separate invocations.
    onProgress?.('AI đang chuyển sang chế độ giải dài, không giới hạn thời gian…');
    let candidate = null;
    let candidateModel = '';
    while (!candidate) {
      if (++attempt > GUIDE_MAX_RESUME_ATTEMPTS) throw firstError;
      if (attempt > 1) await guideWait(guideBackoff(attempt));
      const solved = await postGuidePhaseSafe({ ...basePayload, mode: 'solve' });
      if (solved.resp.ok && solved.json?.success && solved.json.candidate) {
        candidate = solved.json.candidate;
        candidateModel = solved.json.model || '';
        break;
      }
      const error = guideFailure(solved);
      if (!error.retryable) throw error;
      onProgress?.(`Gemini đang quá tải, AI tự thử lại bước giải (lần ${attempt})…`);
    }
    onProgress?.('Đã có lời giải, AI đang kiểm định độc lập…');
    while (true) {
      if (++attempt > GUIDE_MAX_RESUME_ATTEMPTS) throw new Error('AI chưa hoàn tất sau nhiều lần tự tiếp tục. Vui lòng thử lại.');
      if (attempt > 1) await guideWait(guideBackoff(attempt));
      const verified = await postGuidePhaseSafe({ ...basePayload, mode: 'verify', candidate, candidateModel });
      if (verified.resp.ok && verified.json?.success && verified.json.data) return verified.json;
      const error = guideFailure(verified);
      if (!error.retryable) throw error;
      onProgress?.(`Gemini đang quá tải, AI tự thử lại bước kiểm định (lần ${attempt})…`);
    }
  }

  window.openAIGuide = async function(btn, options = {}) {
    const card = btn.closest('.problem-item') || btn.closest('.examplebox') || btn.closest('.book-subsection') || btn.closest('article');
    if (!card || (card.dataset.guideRefreshing === 'true' && !options.regenerate)) return;

    // Xác định ID và thông tin câu hỏi
    const idEl = card.querySelector('.problem-id span:first-child') || card.querySelector('.problem-id') || card.querySelector('.box-heading') || card.querySelector('h3');
    const topicEl = card.querySelector('.badge-topic');
    const contentEl = card.querySelector('.problem-content') || card.querySelector('p');
    const examCard = card.closest('.exam-card');
    const examTitleEl = examCard ? examCard.querySelector('.exam-title') : null;

    const sourceText = extractMathText(contentEl) || cleanElementText(card);
    const cleanTitle = cleanElementText(idEl) || 'Bài toán Olympic';
    const problemId = (card.id || cleanTitle).replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase() + '-' + Math.abs(hashCode(sourceText.slice(0, 50) || 'vmo'));
    const problemTitle = cleanTitle;
    const problemTopic = card.dataset.topic || (topicEl?.textContent || '').trim();
    const problemContent = sourceText;
    const examTitle = card.dataset.setTitle || (examTitleEl?.innerText || examTitleEl?.textContent || '').trim() || 'Ôn luyện Toán';
    const problemKey = card.dataset.contentKey || problemId;

    // Kiểm tra xem panel đã tồn tại chưa
    let existingPanel = card.querySelector('.ai-guide-panel');

    if (existingPanel) {
      if (!options.regenerate && existingPanel.dataset.guideError === 'true') {
        existingPanel.remove();
        existingPanel = null;
      }
    }
    if (existingPanel && !options.regenerate) {
      const isVisible = existingPanel.style.display !== 'none';
      existingPanel.style.display = isVisible ? 'none' : 'block';
      btn.classList.toggle('active', !isVisible);
      btn.innerHTML = isVisible ? '<span class="guide-sparkle">✨</span> AI Hướng dẫn giải' : '<span class="guide-sparkle">🙈</span> Ẩn hướng dẫn';
      if (!isVisible && window.MathJax?.typesetPromise) {
        window.MathJax.typesetPromise([existingPanel]).catch(() => {});
      }
      return;
    }

    // Nếu chưa tồn tại, tạo container và hiện loading
    btn.classList.add('active');
    btn.innerHTML = '<span class="guide-sparkle">⏳</span> Đang soạn lời giải...';

    // Tạo panel tạm thời với loading
    const tempPanel = document.createElement('div');
    tempPanel.className = 'ai-guide-panel';
    tempPanel.id = `ai-panel-${problemId}`;
    tempPanel.innerHTML = `
      <div class="ai-guide-header">
        <div class="ai-guide-title">
          <span>🎓 AI Hướng dẫn giải</span>
          <span class="prof-badge">Gia sư Toán AI</span>
        </div>
      </div>
      <div class="ai-loading-state">
        <div class="ai-spinner"></div>
        <div style="font-weight: 500;">Gia sư Toán AI đang phân tích bản chất bài toán và tổng hợp định lý...</div>
      </div>
    `;

    // Chèn sau problem-content
    if (contentEl && contentEl.nextSibling) {
      contentEl.parentNode.insertBefore(tempPanel, contentEl.nextSibling);
    } else {
      card.appendChild(tempPanel);
    }

    const previousContext = aiGuideContexts.get(problemId);
    if(options.regenerate)tempPanel.id += '-refresh';
    let guideData = null;
    let rawGuide = null;

    // Ưu tiên khôi phục hướng dẫn mà người dùng đã chủ động lưu trước đó.
    if (!options.regenerate && window.VMODataService?.getLatestAiGuide) {
      try {
        const saved = await window.VMODataService.getLatestAiGuide(problemKey);
        if (saved?.aiGuide?.solution) {
          rawGuide = { ...saved.aiGuide,
            branch: saved.aiGuide.branch || problemTopic || 'Toán THPT Chuyên',
            geometryRequested: saved.aiGuide.geometryRequested === true || /hình học|geometry/i.test(problemTopic || '')
          };
          guideData = {
            branch: rawGuide.branch || problemTopic || 'Toán THPT Chuyên',
            knowledge: formatMarkdownToHtml(rawGuide.knowledge || ''),
            intuition: formatMarkdownToHtml(rawGuide.intuition || ''),
            solution: formatMarkdownToHtml(rawGuide.solution || ''),
            pitfalls: formatMarkdownToHtml(rawGuide.pitfalls || ''),
            dna: rawGuide.dna || null,
            redTeam: rawGuide.redTeam || null,
            quality: rawGuide.quality || null,
            adminEdited: saved.aiGuideAdminEdited === true,
            persisted: true,
            savedGuideId: saved.id || saved._id
          };
        }
      } catch (error) {
        console.warn('Không đọc được AI Guide đã lưu, chuyển sang tạo mới:', error?.message || error);
      }
    }

    // Gửi request đến máy chủ; tự tiếp tục qua nhiều phiên nếu Gemini quá tải.
    if (!guideData) try {
      const result = await requestGuidePipeline({
        problemId,
        problemTitle,
        problemContent,
        contentKey: card.dataset.contentKey || '',
        topic: problemTopic,
        examTitle,
        lang: window.currentLang === 'en' ? 'en' : 'vi'
      }, message => {
        const loadingText = tempPanel.querySelector('.ai-loading-state > div:last-child');
        if (loadingText) loadingText.textContent = message;
      });

      if (result.success && result.data) {
        rawGuide = {
          branch: problemTopic || 'Toán THPT Chuyên',
          knowledge: result.data.knowledge || '',
          intuition: result.data.intuition || '',
          solution: result.data.solution || '',
          pitfalls: result.data.pitfalls || '',
          dna: result.data.dna || null,
          redTeam: result.data.redTeam || null,
          quality: result.data.quality || null,
          geometry: window.MathAppGeometry?.clean(result.data.geometry) || null,
          geometryRequested: result.data.geometryRequested === true
        };
        guideData = {
          branch: problemTopic || 'Toán THPT Chuyên',
          knowledge: formatMarkdownToHtml(result.data.knowledge),
          intuition: formatMarkdownToHtml(result.data.intuition),
          solution: formatMarkdownToHtml(result.data.solution),
          pitfalls: formatMarkdownToHtml(result.data.pitfalls),
          dna: result.data.dna || null,
          redTeam: result.data.redTeam || null,
          quality: result.data.quality || null
        };
      } else {
        throw new Error(result.error || 'AI chưa tạo được lời giải đạt chuẩn');
      }
    } catch (err) {
      if(options.regenerate && existingPanel){tempPanel.remove();existingPanel.querySelector('.ai-guide-refresh-error')?.remove();const error=document.createElement('p');error.className='ai-guide-refresh-error';error.setAttribute('role','alert');error.textContent=(err.message || 'Chưa tạo được hướng dẫn mới')+'. Lời giải hiện tại được giữ nguyên.';existingPanel.querySelector('.ai-guide-body')?.prepend(error);window.showVMOToast?.(error.textContent,false);return false;}
      const isEn = window.currentLang === 'en';
      tempPanel.dataset.guideError = 'true';
      tempPanel.innerHTML = `<div class="ai-guide-header"><div class="ai-guide-title"><span>⚠️ ${isEn ? 'Guide not displayed' : 'Chưa hiển thị lời giải'}</span></div></div><div style="padding:18px;color:#991b1b;background:#fff7ed;"><strong>${isEn ? 'Quality gate rejected this result.' : 'Kết quả chưa vượt qua kiểm định chất lượng.'}</strong><div class="ai-guide-error-detail" data-guide-error-message role="alert" style="margin-top:8px;">${String(err.message || '').replace(/[<>&]/g, '')}</div><div style="margin-top:8px;color:#475569;">${isEn ? 'Click the AI Solution Guide button again to retry.' : 'Bấm lại nút AI Hướng dẫn giải để thử lại.'}</div></div>`;
      btn.classList.remove('active');
      btn.innerHTML = isEn ? '<span class="guide-sparkle">🔄</span> Retry AI Guide' : '<span class="guide-sparkle">🔄</span> Thử lại AI Hướng dẫn giải';
      return;
    }

    if (!guideData) {
      if(options.regenerate && existingPanel){tempPanel.remove();return false;}
      tempPanel.dataset.guideError = 'true';
      btn.classList.remove('active');
      btn.innerHTML = '<span class="guide-sparkle">🔄</span> Thử lại AI Hướng dẫn giải';
      return;
    }

    if(options.regenerate)guideData.savedGuideId=previousContext?.savedGuideId || '';
    aiGuideContexts.set(problemId, {
      problemKey,
      problemTitle,
      problemContent,
      examTitle,
      topic: problemTopic,
      setId: card.dataset.setId || '',
      setTitle: card.dataset.setTitle || examTitle,
      sourceType: card.dataset.sourceType || '',
      sourceGroup: card.dataset.sourceGroup || '',
      rawGuide,
      savedGuideId: guideData.savedGuideId || (options.regenerate ? previousContext?.savedGuideId : '') || '',
      adminEdited: false
    });

    // Render HTML hoàn chỉnh
    if(options.regenerate && existingPanel){window.MathJax?.typesetClear?.([existingPanel]);existingPanel.remove();}
    tempPanel.outerHTML = renderAIGuideHtml(problemId, guideData, problemTopic);
    const isEn = (window.currentLang === 'en');
    btn.innerHTML = isEn ? '<span class="guide-sparkle">🙈</span> Hide Guide' : '<span class="guide-sparkle">🙈</span> Ẩn hướng dẫn';

    // Typeset LaTeX bằng MathJax
    const finalPanel = document.getElementById(`ai-panel-${problemId}`);
    if(options.regenerate){
      const notice=document.createElement('p');notice.className='ai-guide-refresh-notice';notice.textContent=window.currentLang==='en'?'Sources rechecked and a new guide generated. Save/Update to store this result.':'Đã đối chiếu lại nguồn và tạo hướng dẫn mới. Bấm Lưu/Cập nhật để lưu kết quả này.';finalPanel?.querySelector('.ai-guide-body')?.prepend(notice);
    }
    mountGuideGeometry(finalPanel, rawGuide);
    mountGuideInsights(finalPanel, rawGuide);
    if (finalPanel && window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise([finalPanel]).catch(() => {});
    }
  };

  window.regenerateAIGuide = async function(problemId, button) {
    if(button?.disabled)return;
    if(!window.confirm(window.currentLang==='en'?'Recheck verified sources and generate a new guide? Unsaved edits will be replaced on success.':'Đối chiếu lại nguồn đã xác minh và tạo hướng dẫn mới? Chỉnh sửa chưa lưu sẽ được thay bằng kết quả mới khi thành công.'))return;
    const panel=document.getElementById(`ai-panel-${problemId}`);
    const card=panel?.closest('.problem-item, .examplebox, .book-subsection, article');
    const guideButton=card?.querySelector('.btn-ai-guide');if(!guideButton)return;
    if(card.dataset.guideRefreshing==='true')return;card.dataset.guideRefreshing='true';
    if(button)button.disabled=true;
    try { await window.openAIGuide(guideButton,{regenerate:true}); }
    finally { delete card.dataset.guideRefreshing;if(button)button.disabled=false; }
  };

  // Render from source in an isolated root, then copy the finished MathJax output.
  // No second AI request, no database write, and no fixed-delay print race.
  window.printAIGuide = async function(problemId) {
    const context = aiGuideContexts.get(problemId);
    const panel = document.getElementById(`ai-panel-${problemId}`);
    if (!context?.rawGuide || !panel) return false;
    const button = panel.querySelector('.btn-ai-guide-print');
    if (button?.disabled) return false;
    const isEn = window.currentLang === 'en';
    // Open synchronously in the click handler so browsers do not block an awaited popup.
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert(isEn ? 'Allow popups to print or save this guide as PDF.' : 'Vui lòng cho phép cửa sổ bật lên để in hoặc lưu PDF.');
      return false;
    }
    if (button) button.disabled = true;
    const output = printWindow.document;
    let root;
    try {
      output.open();
      output.write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><p role="status"></p></body></html>');
      output.close();
      output.documentElement.lang = isEn ? 'en' : 'vi';
      output.title = `${isEn ? 'AI Solution Guide' : 'AI Hướng dẫn giải'} - ${context.problemTitle || 'MathApp'}`;
      output.querySelector('[role="status"]').textContent = isEn ? 'Preparing equations for printing…' : 'Đang chuẩn bị công thức để in…';
      const style = output.createElement('style');
      style.textContent = `
        @page { size: A4; margin: 18mm 16mm; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #111827; background: white; font: 11pt/1.65 "Times New Roman", Times, serif; }
        main { max-width: 178mm; margin: 20px auto; padding: 0 8px; overflow-wrap: anywhere; }
        h1 { font-size: 18pt; text-align: center; margin: 0 0 12pt; }
        h2 { font-size: 13pt; margin: 16pt 0 6pt; break-after: avoid; page-break-after: avoid; }
        p { margin: 5pt 0; orphans: 3; widows: 3; }
        .guide-meta { color: #374151; font-size: 10pt; }
        mjx-container { max-width: 100%; }
        mjx-container[display="true"] { overflow: visible !important; break-inside: avoid; page-break-inside: avoid; }
        .print-tools { padding: 12px; background: #eff6ff; font: 14px/1.5 system-ui, sans-serif; }
        button { padding: 8px 12px; cursor: pointer; }
        @media print { main { max-width: none; margin: 0; padding: 0; } .print-tools { display: none !important; } }
      `;
      output.head.append(style);
      root = document.createElement('main');
      root.className = 'tex2jax_process';
      root.style.cssText = 'position:absolute;left:-100000px;top:0;width:178mm;background:white;color:black;';
      const title = document.createElement('h1'); title.textContent = isEn ? 'AI SOLUTION GUIDE' : 'AI HƯỚNG DẪN GIẢI'; root.append(title);
      const metadata = document.createElement('p'); metadata.className = 'guide-meta';
      metadata.textContent = [context.examTitle, context.problemTitle, context.topic].filter(Boolean).join(' · '); root.append(metadata);
      const statement = document.createElement('section');
      const statementTitle = document.createElement('h2'); statementTitle.textContent = isEn ? 'Problem statement' : 'Đề bài';
      const statementBody = document.createElement('div'); statementBody.innerHTML = formatMarkdownToHtml(context.problemContent);
      statement.append(statementTitle, statementBody); root.append(statement);
      for (const field of GUIDE_EDIT_FIELDS) {
        const section = document.createElement('section'); section.dataset.guideField = field;
        const heading = document.createElement('h2');
        heading.textContent = panel.querySelector(`[data-guide-field="${field}"] .ai-section-title`)?.textContent.trim() || field;
        const body = document.createElement('div');
        const editor = panel.querySelector(`[data-guide-editor="${field}"]`);
        body.innerHTML = formatMarkdownToHtml(editor ? editor.value : context.rawGuide[field]);
        section.append(heading, body);
        if (field === 'solution') {
          const changed = GUIDE_EDIT_FIELDS.some(key => { const draft = panel.querySelector(`[data-guide-editor="${key}"]`); return draft && draft.value !== context.rawGuide[key]; });
          appendGuideGeometry(section, changed ? { ...context.rawGuide, geometry: null, geometryRequested: context.rawGuide.geometryRequested || Boolean(context.rawGuide.geometry) } : context.rawGuide, isEn);
        }
        root.append(section);
      }
      document.body.append(root);
      if (window.MathJax?.startup?.promise) await window.MathJax.startup.promise;
      if (!window.MathJax?.typesetPromise) throw new Error(isEn ? 'MathJax is not ready. Please try again.' : 'MathJax chưa sẵn sàng. Vui lòng thử lại.');
      await window.MathJax.typesetPromise([root]);
      if (root.querySelector('mjx-merror, [data-mjx-error]')) throw new Error(isEn ? 'Please correct invalid equations before printing.' : 'Có công thức chưa hợp lệ. Vui lòng kiểm tra trước khi in.');
      if (printWindow.closed) return false;
      // CHTML fonts/styles are generated in the source document by MathJax.
      document.querySelectorAll('style[id^="MJX-"], link[id^="MJX-"]').forEach(node => output.head.append(output.importNode(node, true)));
      const base = output.createElement('base'); base.href = new URL('.', document.baseURI).href; output.head.prepend(base);
      const tools = output.createElement('div'); tools.className = 'print-tools';
      const retry = output.createElement('button'); retry.type = 'button'; retry.textContent = isEn ? 'Print / Save as PDF' : 'In / Lưu PDF';
      retry.onclick = () => printWindow.print();
      const hint = output.createElement('span'); hint.textContent = isEn ? ' Choose “Save as PDF” in the print dialog.' : ' Chọn “Lưu dưới dạng PDF” trong hộp thoại in.';
      tools.append(retry, hint);
      const copy = output.importNode(root, true); copy.removeAttribute('style');
      output.body.replaceChildren(tools, copy);
      // Force layout so font requests start before waiting for document.fonts.ready.
      copy.getBoundingClientRect();
      if (output.fonts?.ready) await output.fonts.ready;
      if (printWindow.closed) return false;
      printWindow.focus(); printWindow.print();
      return true;
    } catch (error) {
      if (!printWindow.closed) {
        output.body.replaceChildren();
        const message = output.createElement('p'); message.setAttribute('role', 'alert');
        message.textContent = error.message || (isEn ? 'Unable to prepare the printout.' : 'Chưa chuẩn bị được bản in.'); output.body.append(message);
      }
      window.showVMOToast?.(error.message || 'Chưa chuẩn bị được bản in.', false);
      return false;
    } finally {
      if (root) {
        try { window.MathJax?.typesetClear?.([root]); } catch (_) {}
        root.remove();
      }
      if (button) button.disabled = false;
    }
  };

  // Đóng/Thu gọn panel
  window.toggleAIGuidePanel = function(problemId) {
    const panel = document.getElementById(`ai-panel-${problemId}`);
    if (!panel) return;
    const card = panel.closest('.problem-item') || panel.closest('.examplebox') || panel.parentElement;
    const btn = card ? card.querySelector('.btn-ai-guide') : null;
    panel.style.display = 'none';
    if (btn) {
      btn.classList.remove('active');
      const isEn = (window.currentLang === 'en');
      btn.innerHTML = isEn ? '<span class="guide-sparkle">✨</span> AI Solution Guide' : '<span class="guide-sparkle">✨</span> AI Hướng dẫn giải';
    }
  };

  const GUIDE_EDIT_FIELDS = ['knowledge', 'intuition', 'solution', 'pitfalls'];

  function isAdminGuideEditor() {
    return ['admin', 'teacher'].includes(window.VMOAuth?.getSession?.()?.role);
  }

  function setGuideEditorState(panel, editing) {
    if (!panel) return;
    panel.dataset.guideEditing = editing ? 'true' : 'false';
    const edit = panel.querySelector('.btn-ai-guide-edit');
    const apply = panel.querySelector('.btn-ai-guide-apply');
    const cancel = panel.querySelector('.btn-ai-guide-cancel');
    if (edit) edit.style.display = editing ? 'none' : '';
    if (apply) apply.style.display = editing ? '' : 'none';
    if (cancel) cancel.style.display = editing ? '' : 'none';
    const diagramButton = panel.querySelector('.ai-geometry-generate');
    if (diagramButton) diagramButton.disabled = editing;
  }

  function appendGuideGeometry(container, guide, isEn, onGenerate) {
    const figure = window.MathAppGeometry?.figure(document, guide?.geometry, isEn);
    if (figure) container.append(figure);
    const eligible = figure || guide?.geometryRequested || /hình học|geometry/i.test(guide?.branch || '');
    if (!figure && eligible) {
      const notice = document.createElement('p'); notice.className = 'ai-geometry-unavailable';
      notice.textContent = isEn ? 'No validated diagram is available for this guide.' : 'Chưa có hình vẽ hợp lệ cho hướng dẫn giải này.';
      container.append(notice);
    }
    if (eligible && onGenerate) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'btn-guide-action ai-geometry-generate';
      button.textContent = figure ? (isEn ? 'Redraw diagram' : 'Vẽ lại hình') : (isEn ? 'Create / retry diagram' : 'Tạo / Thử lại hình vẽ');
      button.onclick = onGenerate; container.append(button);
    }
  }

  function mountGuideGeometry(panel, guide) {
    const section = panel?.querySelector('[data-guide-field="solution"]');
    if (!section) return;
    section.querySelectorAll('.ai-geometry-figure, .ai-geometry-unavailable, .ai-geometry-generate').forEach(node => node.remove());
    appendGuideGeometry(section, guide, window.currentLang === 'en', () => window.generateAIGuideDiagram(panel.id.replace('ai-panel-', '')));
  }

  const RED_TEAM_VERDICT_TEXT = {
    passed: { vi: 'Đạt phản biện', en: 'Red Team passed' },
    concerns: { vi: 'Cần lưu ý', en: 'Concerns found' },
    rejected: { vi: 'Bị bác bỏ', en: 'Rejected' }
  };
  const RED_TEAM_SEVERITY_TEXT = {
    minor: { vi: 'Nhẹ', en: 'Minor' },
    major: { vi: 'Nặng', en: 'Major' },
    fatal: { vi: 'Nghiêm trọng', en: 'Fatal' }
  };
  const RED_TEAM_TYPE_TEXT = {
    logic: { vi: 'Logic', en: 'Logic' },
    counterexample: { vi: 'Phản ví dụ', en: 'Counterexample' },
    edge_case: { vi: 'Trường hợp biên', en: 'Edge case' },
    quantifier: { vi: 'Lượng từ', en: 'Quantifier' },
    assumption: { vi: 'Giả thiết ngầm', en: 'Assumption' },
    algebra: { vi: 'Đại số', en: 'Algebra' }
  };

  function renderRedTeamPanel(panel, report) {
    const host = panel?.querySelector('[data-redteam-panel]');
    if (!host) return;
    if (!report || typeof report !== 'object') {
      host.hidden = true;
      host.replaceChildren();
      return;
    }
    const isEn = window.currentLang === 'en';
    const pick = (table, key) => (table[key] || table.logic || { vi: key, en: key })[isEn ? 'en' : 'vi'];
    const wrap = document.createElement('div');
    wrap.className = 'ai-insight-card';
    const header = document.createElement('div');
    header.className = 'ai-insight-head';
    const title = document.createElement('span');
    title.textContent = isEn ? '🛡️ AI Red Team — adversarial review' : '🛡️ AI Red Team — hội đồng phản biện';
    const verdict = document.createElement('span');
    verdict.className = `ai-redteam-verdict ai-redteam-verdict-${report.verdict || 'concerns'}`;
    verdict.textContent = `${pick(RED_TEAM_VERDICT_TEXT, report.verdict || 'concerns')}${report.revisedScore ? ` · ${report.revisedScore}` : ''}`;
    header.append(title, verdict);
    wrap.append(header);

    if (report.summary) {
      const summary = document.createElement('p');
      summary.className = 'ai-insight-summary';
      summary.textContent = report.summary;
      wrap.append(summary);
    }

    if (Array.isArray(report.reviewers) && report.reviewers.length) {
      const row = document.createElement('div');
      row.className = 'ai-redteam-roles';
      report.reviewers.forEach(reviewer => {
        const chip = document.createElement('span');
        chip.className = `ai-redteam-role ai-redteam-role-${reviewer.verdict || 'concerns'}`;
        chip.textContent = `${reviewer.title || reviewer.role || 'Reviewer'} · ${reviewer.objectionCount ?? 0}`;
        row.append(chip);
      });
      wrap.append(row);
    }

    const confirmed = Array.isArray(report.confirmedObjections) ? report.confirmedObjections : [];
    const listTitle = document.createElement('p');
    listTitle.className = 'ai-insight-subtitle';
    listTitle.textContent = isEn
      ? `Confirmed objections (${confirmed.length})`
      : `Lỗi được xác nhận (${confirmed.length})`;
    wrap.append(listTitle);
    if (!confirmed.length) {
      const empty = document.createElement('p');
      empty.className = 'ai-redteam-empty';
      empty.textContent = isEn
        ? 'No evidence-backed objection survived screening. The proof passed this adversarial review.'
        : 'Không có phản biện nào vượt qua bước kiểm chứng bằng chứng. Lời giải đạt phản biện độc lập.';
      wrap.append(empty);
    } else {
      const list = document.createElement('ol');
      list.className = 'ai-redteam-objections';
      confirmed.forEach(item => {
        const li = document.createElement('li');
        li.className = `ai-redteam-objection ai-redteam-${item.severity || 'major'}`;
        const meta = document.createElement('div');
        meta.className = 'ai-redteam-meta';
        meta.textContent = `${pick(RED_TEAM_SEVERITY_TEXT, item.severity || 'major')} · ${pick(RED_TEAM_TYPE_TEXT, item.type || 'logic')}${item.step ? ` · ${isEn ? 'step' : 'bước'} ${item.step}` : ''}`;
        const reason = document.createElement('p');
        reason.textContent = item.reason || item.claim || '';
        li.append(meta, reason);
        if (item.proposedFix) {
          const fix = document.createElement('p');
          fix.className = 'ai-redteam-fix';
          fix.textContent = `${isEn ? 'Fix: ' : 'Cách sửa: '}${item.proposedFix}`;
          li.append(fix);
        }
        if (item.counterexample) {
          const counter = document.createElement('p');
          counter.className = 'ai-redteam-counterexample';
          counter.textContent = `${isEn ? 'Counterexample: ' : 'Phản ví dụ: '}${item.counterexample}`;
          li.append(counter);
        }
        list.append(li);
      });
      wrap.append(list);
    }

    const rejectedCount = Number(report.rejectedObjectionCount) || 0;
    if (rejectedCount > 0) {
      const note = document.createElement('p');
      note.className = 'ai-redteam-screened';
      note.textContent = isEn
        ? `${rejectedCount} objection(s) were discarded because their quoted evidence was not in the solution.`
        : `${rejectedCount} phản biện đã bị loại vì trích dẫn không khớp với lời giải.`;
      wrap.append(note);
    }
    host.replaceChildren(wrap);
    host.hidden = false;
  }

  function renderDnaPanel(panel, dna) {
    const host = panel?.querySelector('[data-dna-panel]');
    if (!host) return;
    if (!dna || typeof dna !== 'object') {
      host.hidden = true;
      host.replaceChildren();
      return;
    }
    const isEn = window.currentLang === 'en';
    const wrap = document.createElement('div');
    wrap.className = 'ai-insight-card';
    const header = document.createElement('div');
    header.className = 'ai-insight-head';
    const title = document.createElement('span');
    title.textContent = isEn ? '🧬 Math DNA — reusable structure' : '🧬 Math DNA — cấu trúc kỹ thuật';
    const difficulty = document.createElement('span');
    difficulty.className = 'ai-dna-difficulty';
    difficulty.textContent = `${isEn ? 'Difficulty' : 'Độ khó'} ${dna.difficulty || 3}/5`;
    header.append(title, difficulty);
    wrap.append(header);

    if (dna.primaryTechnique?.label) {
      const primary = document.createElement('p');
      primary.className = 'ai-insight-summary';
      primary.textContent = `${isEn ? 'Primary technique: ' : 'Kỹ thuật chính: '}${dna.primaryTechnique.label}`;
      wrap.append(primary);
    }

    const tags = Array.isArray(dna.techniqueTags) ? dna.techniqueTags : [];
    if (tags.length) {
      const chips = document.createElement('div');
      chips.className = 'ai-dna-chips';
      tags.forEach(tag => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'ai-dna-chip';
        chip.dataset.techniqueId = tag.id;
        chip.title = isEn ? `Find problems using ${tag.label}` : `Tìm bài cùng kỹ thuật ${tag.label}`;
        chip.textContent = tag.label;
        chip.onclick = () => window.findProblemsByTechnique(tag.id, tag.label, panel.id.replace('ai-panel-', ''));
        chips.append(chip);
      });
      wrap.append(chips);
    }

    if (dna.insight) {
      const insight = document.createElement('p');
      insight.className = 'ai-dna-insight';
      insight.textContent = dna.insight;
      wrap.append(insight);
    }

    const dependencies = Array.isArray(dna.hypothesisDependencies) ? dna.hypothesisDependencies : [];
    if (dependencies.length) {
      const heading = document.createElement('p');
      heading.className = 'ai-insight-subtitle';
      heading.textContent = isEn ? 'Hypothesis dependencies' : 'Phụ thuộc giả thiết';
      const list = document.createElement('ul');
      list.className = 'ai-dna-list';
      dependencies.forEach(item => {
        const li = document.createElement('li');
        const used = item.used ? (isEn ? 'used' : 'được dùng') : (isEn ? 'not used' : 'không dùng');
        li.textContent = `${item.hypothesis} (${used}): ${item.consequenceIfRemoved}`;
        list.append(li);
      });
      wrap.append(heading, list);
    }

    const prerequisites = Array.isArray(dna.prerequisites) ? dna.prerequisites : [];
    if (prerequisites.length) {
      const heading = document.createElement('p');
      heading.className = 'ai-insight-subtitle';
      heading.textContent = isEn ? 'Prerequisites' : 'Kiến thức tiên quyết';
      const list = document.createElement('ul');
      list.className = 'ai-dna-list';
      prerequisites.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.concept}: ${item.whyNeeded}`;
        list.append(li);
      });
      wrap.append(heading, list);
    }

    const similar = document.createElement('div');
    similar.className = 'ai-dna-similar';
    wrap.append(similar);
    host.replaceChildren(wrap);
    host.hidden = false;
  }

  function mountGuideInsights(panel, guide) {
    if (!panel) return;
    renderDnaPanel(panel, guide?.dna);
    renderRedTeamPanel(panel, guide?.redTeam);
  }

  window.generateAIGuideDiagram = async function(problemId) {
    const context = aiGuideContexts.get(problemId), panel = document.getElementById(`ai-panel-${problemId}`);
    if (!context || !panel || context.diagramBusy || panel.dataset.guideEditing === 'true') return false;
    const button = panel.querySelector('.ai-geometry-generate');
    const guideAtStart = context.rawGuide;
    const originalButtonText = button?.textContent;
    const solution = guideAtStart.solution;
    context.diagramBusy = true;
    if (button) { button.disabled = true; button.textContent = window.currentLang === 'en' ? 'Drawing…' : 'Đang dựng và kiểm tra hình…'; }
    try {
      const response = await fetch('/api/ai-guide', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        mode: 'diagram', contentKey: context.problemKey, problemId, problemTitle: context.problemTitle,
        problemContent: context.problemContent, topic: context.topic, examTitle: context.examTitle,
        solution, lang: window.currentLang === 'en' ? 'en' : 'vi'
      }) });
      const result = await response.json();
      const geometry = window.MathAppGeometry?.clean(result.data?.geometry);
      if (!response.ok || !result.success || !geometry) {
        const details = [result.reason, ...(Array.isArray(result.details) ? result.details.map(item => item?.message) : [])].filter(item => typeof item === 'string' && item.trim()).join(' ').slice(0, 1500);
        const summary = result.error || (window.currentLang === 'en' ? 'No validated diagram is available.' : 'Chưa có hình vẽ hợp lệ.');
        throw new Error([summary, result.code ? `[${result.code}]` : '', details].filter(Boolean).join(' '));
      }
      if (context.rawGuide !== guideAtStart || panel.dataset.guideEditing === 'true') throw new Error(window.currentLang === 'en' ? 'The solution changed. Please retry the diagram.' : 'Lời giải đã thay đổi. Vui lòng dựng lại hình.');
      context.rawGuide = { ...context.rawGuide, geometry, geometryRequested: true };
      mountGuideGeometry(panel, context.rawGuide);
      return true;
    } catch (error) {
      let notice = panel.querySelector('.ai-geometry-unavailable');
      if (!notice) {
        notice = document.createElement('p'); notice.className = 'ai-geometry-unavailable';
        panel.querySelector('[data-guide-field="solution"]')?.append(notice);
      }
      notice.textContent = error.message;
      return false;
    } finally {
      context.diagramBusy = false;
      if (button) { button.disabled = false; button.textContent = originalButtonText || (window.currentLang === 'en' ? 'Create / retry diagram' : 'Tạo / Thử lại hình vẽ'); }
    }
  };

  function renderGuideFields(problemId, guide) {
    const panel = document.getElementById(`ai-panel-${problemId}`);
    if (!panel) return;
    if (window.MathJax?.typesetClear) {
      try { window.MathJax.typesetClear([panel]); } catch (_) {}
    }
    GUIDE_EDIT_FIELDS.forEach(field => {
      const content = panel.querySelector(`[data-guide-field="${field}"] .ai-section-content`);
      if (content) content.innerHTML = formatMarkdownToHtml(guide?.[field] || '');
    });
    mountGuideGeometry(panel, guide);
    mountGuideInsights(panel, guide);
    setGuideEditorState(panel, false);
    if (window.MathJax?.typesetPromise) window.MathJax.typesetPromise([panel]).catch(() => {});
  }

  // ── AI Red Team action ───────────────────────────────────────────────────
  window.openRedTeam = async function(problemId) {
    const context = aiGuideContexts.get(problemId);
    const panel = document.getElementById(`ai-panel-${problemId}`);
    if (!context?.rawGuide || !panel) return false;
    if (context.redTeamBusy) return false;
    const solution = String(context.rawGuide.solution || '');
    const isEn = window.currentLang === 'en';
    if (solution.trim().length < 120) {
      window.showVMOToast?.(isEn ? 'The solution is too short for an adversarial review.' : 'Lời giải quá ngắn để phản biện.', false);
      return false;
    }
    const button = panel.querySelector('.btn-ai-guide-redteam');
    const original = button?.textContent;
    context.redTeamBusy = true;
    if (button) { button.disabled = true; button.textContent = isEn ? '🛡️ Reviewing…' : '🛡️ Đang phản biện…'; }
    const host = panel.querySelector('[data-redteam-panel]');
    if (host) {
      host.hidden = false;
      host.replaceChildren();
      const loading = document.createElement('div');
      loading.className = 'ai-insight-card ai-insight-loading';
      loading.innerHTML = '<div class="ai-spinner"></div>';
      const text = document.createElement('p');
      text.textContent = isEn
        ? 'Three independent reviewers are attacking the proof; their objections will be screened for verifiable evidence.'
        : 'Ba AI độc lập đang tấn công lời giải; mọi phản biện sẽ được kiểm tra bằng chứng trước khi trọng tài kết luận.';
      loading.append(text);
      host.append(loading);
    }
    try {
      const response = await fetch('/api/ai-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'redteam',
          problemId,
          problemTitle: context.problemTitle,
          problemContent: context.problemContent,
          contentKey: context.problemKey || '',
          topic: context.topic,
          examTitle: context.examTitle,
          solution,
          lang: isEn ? 'en' : 'vi'
        })
      });
      const result = await response.json().catch(() => ({}));
      const report = result?.data?.redTeam;
      if (!response.ok || !result.success || !report) {
        throw new Error(result?.error || (isEn ? 'The Red Team could not complete the review.' : 'AI Red Team chưa hoàn tất phản biện.'));
      }
      context.rawGuide = { ...context.rawGuide, redTeam: report };
      renderRedTeamPanel(panel, report);
      refreshRedTeamBadge(panel, report);
      window.showVMOToast?.(report.verdict === 'passed'
        ? (isEn ? 'Red Team passed: no evidence-backed objection.' : 'AI Red Team đạt: không có phản biện nào đứng vững.')
        : (isEn ? 'Red Team found points that need attention.' : 'AI Red Team phát hiện điểm cần xem lại.'), report.verdict !== 'rejected');
      return true;
    } catch (error) {
      renderRedTeamPanel(panel, null);
      if (host) {
        host.hidden = false;
        const message = document.createElement('p');
        message.className = 'ai-insight-error';
        message.setAttribute('role', 'alert');
        message.textContent = error.message || (isEn ? 'Red Team failed.' : 'AI Red Team gặp lỗi.');
        host.append(message);
      }
      window.showVMOToast?.(error.message || 'AI Red Team gặp lỗi.', false);
      return false;
    } finally {
      context.redTeamBusy = false;
      if (button) { button.disabled = false; button.textContent = original || '🛡️ AI Red Team'; }
    }
  };

  function refreshRedTeamBadge(panel, report) {
    const title = panel?.querySelector('.ai-guide-title');
    if (!title || !report) return;
    title.querySelector('.ai-guide-redteam-badge')?.remove();
    const isEn = window.currentLang === 'en';
    const badge = document.createElement('span');
    badge.className = `prof-badge ai-guide-redteam-badge ai-redteam-verdict-${report.verdict}`;
    badge.style.cssText = 'background:#fef2f2;color:#991b1b;';
    badge.textContent = `🛡️ ${report.verdict === 'passed' ? (isEn ? 'Red Team passed' : 'Red Team đạt') : report.verdict === 'rejected' ? (isEn ? 'Red Team rejected' : 'Red Team bác bỏ') : (isEn ? 'Red Team concerns' : 'Red Team lưu ý')}`;
    const dnaBadge = title.querySelector('.ai-guide-dna-badge');
    if (dnaBadge) dnaBadge.after(badge); else title.append(badge);
  }

  // ── Math DNA action ──────────────────────────────────────────────────────
  window.openMathDna = async function(problemId) {
    const context = aiGuideContexts.get(problemId);
    const panel = document.getElementById(`ai-panel-${problemId}`);
    if (!context?.rawGuide || !panel) return false;
    if (context.dnaBusy) return false;
    const isEn = window.currentLang === 'en';
    const button = panel.querySelector('.btn-ai-guide-dna');
    const original = button?.textContent;
    context.dnaBusy = true;
    if (button) { button.disabled = true; button.textContent = isEn ? '🧬 Extracting…' : '🧬 Đang trích xuất…'; }
    const host = panel.querySelector('[data-dna-panel]');
    if (host) {
      host.hidden = false;
      host.replaceChildren();
      const loading = document.createElement('div');
      loading.className = 'ai-insight-card ai-insight-loading';
      loading.innerHTML = '<div class="ai-spinner"></div>';
      const text = document.createElement('p');
      text.textContent = isEn
        ? 'Extracting techniques, hypothesis dependencies and prerequisites…'
        : 'Đang trích xuất kỹ thuật, phụ thuộc giả thiết và kiến thức tiên quyết…';
      loading.append(text);
      host.append(loading);
    }
    try {
      const response = await fetch('/api/ai-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'dna',
          problemId,
          problemTitle: context.problemTitle,
          problemContent: context.problemContent,
          contentKey: context.problemKey || '',
          topic: context.topic,
          examTitle: context.examTitle,
          solution: String(context.rawGuide.solution || ''),
          lang: isEn ? 'en' : 'vi'
        })
      });
      const result = await response.json().catch(() => ({}));
      const dna = result?.data?.dna;
      if (!response.ok || !result.success || !dna) {
        throw new Error(result?.error || (isEn ? 'Math DNA extraction failed.' : 'Chưa trích xuất được Math DNA.'));
      }
      context.rawGuide = { ...context.rawGuide, dna };
      renderDnaPanel(panel, dna);
      refreshDnaBadge(panel, dna);
      window.showVMOToast?.(isEn ? 'Math DNA extracted.' : 'Đã trích xuất Math DNA.', true);
      return true;
    } catch (error) {
      renderDnaPanel(panel, null);
      if (host) {
        host.hidden = false;
        const message = document.createElement('p');
        message.className = 'ai-insight-error';
        message.setAttribute('role', 'alert');
        message.textContent = error.message || (isEn ? 'Math DNA failed.' : 'Math DNA gặp lỗi.');
        host.append(message);
      }
      window.showVMOToast?.(error.message || 'Math DNA gặp lỗi.', false);
      return false;
    } finally {
      context.dnaBusy = false;
      if (button) { button.disabled = false; button.textContent = original || '🧬 Math DNA'; }
    }
  };

  function refreshDnaBadge(panel, dna) {
    const title = panel?.querySelector('.ai-guide-title');
    if (!title || !dna?.primaryTechnique?.label) return;
    title.querySelector('.ai-guide-dna-badge')?.remove();
    const badge = document.createElement('span');
    badge.className = 'prof-badge ai-guide-dna-badge';
    badge.style.cssText = 'background:#ecfeff;color:#155e75;';
    badge.textContent = `🧬 ${dna.primaryTechnique.label}`;
    const quality = title.querySelector('.ai-guide-quality-badge');
    if (quality) quality.after(badge); else title.append(badge);
  }

  window.findProblemsByTechnique = async function(techniqueId, techniqueLabel, problemId) {
    const context = aiGuideContexts.get(problemId);
    const panel = document.getElementById(`ai-panel-${problemId}`);
    const host = panel?.querySelector('.ai-dna-similar');
    if (!host) return false;
    const isEn = window.currentLang === 'en';
    host.replaceChildren();
    const loading = document.createElement('p');
    loading.className = 'ai-dna-similar-loading';
    loading.textContent = isEn ? 'Searching problems with the same technique…' : 'Đang tìm bài cùng kỹ thuật…';
    host.append(loading);
    try {
      const response = await fetch(`/api/data?resource=math_dna&technique=${encodeURIComponent(techniqueId)}&limit=20`, {
        credentials: 'include', cache: 'no-store'
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) throw new Error(result?.error || 'Không tra cứu được Math DNA');
      const currentKey = String(context?.problemKey || '');
      const items = (Array.isArray(result.items) ? result.items : [])
        .filter(item => item.problemKey && String(item.problemKey) !== currentKey)
        .slice(0, 12);
      host.replaceChildren();
      const heading = document.createElement('p');
      heading.className = 'ai-insight-subtitle';
      heading.textContent = `${isEn ? 'Problems using' : 'Bài cùng kỹ thuật'} ${techniqueLabel || techniqueId} (${items.length})`;
      host.append(heading);
      if (!items.length) {
        const empty = document.createElement('p');
        empty.className = 'ai-dna-similar-empty';
        empty.textContent = isEn
          ? 'No other problem has this DNA yet. Extract DNA for more problems to build the map.'
          : 'Chưa có bài khác cùng Math DNA. Hãy trích xuất DNA thêm để xây bản đồ kỹ thuật.';
        host.append(empty);
        return true;
      }
      const list = document.createElement('ul');
      list.className = 'ai-dna-similar-list';
      items.forEach(item => {
        const li = document.createElement('li');
        const open = document.createElement('button');
        open.type = 'button';
        open.className = 'ai-dna-similar-item';
        const label = document.createElement('strong');
        label.textContent = item.title || item.problemKey;
        const meta = document.createElement('span');
        meta.textContent = [
          item.topic,
          item.primaryTechnique?.label,
          item.difficulty ? `${isEn ? 'level' : 'mức'} ${item.difficulty}` : ''
        ].filter(Boolean).join(' · ');
        open.append(label, meta);
        open.onclick = () => window.locateProblemByKey(item.problemKey);
        li.append(open);
        list.append(li);
      });
      host.append(list);
      return true;
    } catch (error) {
      host.replaceChildren();
      const message = document.createElement('p');
      message.className = 'ai-insight-error';
      message.textContent = error.message || (isEn ? 'Could not search by technique.' : 'Không tra cứu được theo kỹ thuật.');
      host.append(message);
      return false;
    }
  };

  window.locateProblemByKey = function(problemKey) {
    const key = String(problemKey || '').trim();
    if (!key) return false;
    const candidates = [...document.querySelectorAll('[data-content-key]')];
    const target = candidates.find(node => node.dataset.contentKey === key)
      || candidates.find(node => node.dataset.problemKey === key);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('ai-problem-highlight');
      setTimeout(() => target.classList.remove('ai-problem-highlight'), 2600);
      return true;
    }
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(key).catch(() => {});
    window.showVMOToast?.(`Đã sao chép mã bài: ${key}. Bài này có thể nằm ở tab khác.`, true);
    return false;
  };

  window.editAIGuideContent = function(problemId) {
    if (!isAdminGuideEditor()) return;
    const panel = document.getElementById(`ai-panel-${problemId}`);
    const context = aiGuideContexts.get(problemId);
    if (!panel || !context?.rawGuide || panel.dataset.guideEditing === 'true') return;

    if (window.MathJax?.typesetClear) {
      try { window.MathJax.typesetClear([panel]); } catch (_) {}
    }
    GUIDE_EDIT_FIELDS.forEach(field => {
      const content = panel.querySelector(`[data-guide-field="${field}"] .ai-section-content`);
      if (!content) return;
      const editor = document.createElement('textarea');
      editor.className = 'ai-guide-source-editor';
      editor.dataset.guideEditor = field;
      editor.setAttribute('aria-label', `Chỉnh sửa ${field}`);
      editor.value = String(context.rawGuide[field] || '');
      content.replaceChildren(editor);
    });
    setGuideEditorState(panel, true);
    panel.querySelector('.ai-guide-source-editor')?.focus();
  };

  window.applyAIGuideEdits = function(problemId, options = {}) {
    if (!isAdminGuideEditor()) return false;
    const panel = document.getElementById(`ai-panel-${problemId}`);
    const context = aiGuideContexts.get(problemId);
    if (!panel || !context?.rawGuide) return false;
    if (panel.dataset.guideEditing !== 'true') return true;

    const edited = {};
    for (const field of GUIDE_EDIT_FIELDS) {
      const editor = panel.querySelector(`[data-guide-editor="${field}"]`);
      edited[field] = String(editor?.value || '').trim();
      if (!edited[field]) {
        editor?.focus();
        window.showVMOToast?.('Bốn phần nội dung AI hướng dẫn giải không được để trống.', false);
        return false;
      }
    }

    const proofChanged = GUIDE_EDIT_FIELDS.some(field => edited[field] !== context.rawGuide[field]);
    context.rawGuide = {
      ...context.rawGuide,
      ...edited,
      geometry: proofChanged ? null : context.rawGuide.geometry,
      geometryRequested: context.rawGuide.geometryRequested || Boolean(context.rawGuide.geometry),
      dna: proofChanged ? null : context.rawGuide.dna,
      redTeam: proofChanged ? null : context.rawGuide.redTeam,
      quality: context.rawGuide.quality
        ? { ...context.rawGuide.quality, verified: false, score: '' }
        : null
    };
    context.adminEdited = true;
    renderGuideFields(problemId, context.rawGuide);
    panel.querySelector('.ai-guide-quality-badge')?.remove();
    if (proofChanged) {
      panel.querySelector('.ai-guide-dna-badge')?.remove();
      panel.querySelector('.ai-guide-redteam-badge')?.remove();
    }
    if (!panel.querySelector('.ai-guide-admin-edited-badge')) {
      const badge = document.createElement('span');
      badge.className = 'prof-badge ai-guide-admin-edited-badge';
      badge.style.cssText = 'background:#f3e8ff;color:#6b21a8;';
      badge.textContent = '✏️ Admin đã chỉnh sửa';
      panel.querySelector('.ai-guide-title')?.appendChild(badge);
    }
    if (!options.silent) {
      window.showVMOToast?.('Đã áp dụng nội dung chỉnh sửa. Kiểm tra hiển thị công thức rồi lưu vào cơ sở dữ liệu.', true);
    }
    return true;
  };

  window.cancelAIGuideEdits = function(problemId) {
    if (!isAdminGuideEditor()) return;
    const context = aiGuideContexts.get(problemId);
    if (!context?.rawGuide) return;
    renderGuideFields(problemId, context.rawGuide);
  };

  // Lưu hướng dẫn giải của AI / Lời giải vào MongoDB thông qua API
  window.saveAIGuideToDatabase = async function(problemId, topic) {
    const btn = document.getElementById(`btn-save-ai-${problemId}`);
    const body = document.getElementById(`ai-body-${problemId}`);
    if (!body) return;

    if (body.closest('.ai-guide-panel')?.dataset.guideEditing === 'true' &&
        !window.applyAIGuideEdits(problemId, { silent: true })) return;

    // Save source math without SVG labels, captions or diagram action buttons.
    const guideSource = aiGuideContexts.get(problemId)?.rawGuide;
    const solutionText = guideSource
      ? GUIDE_EDIT_FIELDS.map(field => String(guideSource[field] || '')).join('\n\n').trim()
      : body.innerText.trim();
    if (!solutionText) {
      alert('Không tìm thấy nội dung lời giải để lưu!');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '⏳ Đang lưu vào cơ sở dữ liệu...';
    }

    try {
      if (window.VMODataService && window.VMODataService.submitSolution) {
        const context = aiGuideContexts.get(problemId) || {};
        const stableProblemKey = context.problemKey || problemId;
        const hasSavedGuide = /^[a-f\d]{24}$/i.test(String(context.savedGuideId || ''));
        const saved = hasSavedGuide && context.adminEdited && isAdminGuideEditor() && window.VMODataService.updateAiGuide
          ? await window.VMODataService.updateAiGuide(context.savedGuideId, context.rawGuide, solutionText)
          : await window.VMODataService.submitSolution(
            stableProblemKey,
            context.problemTitle || `AI Hướng dẫn - ${topic || 'Bài toán VMO'}`,
            solutionText,
            null,
            '',
            {
              problemKey: stableProblemKey,
              setId: context.setId || '',
              setTitle: context.setTitle || context.examTitle || '',
              sourceType: context.sourceType || '',
              sourceGroup: context.sourceGroup || '',
              topic: context.topic || topic || '',
              problemContent: context.problemContent || '',
              submissionKind: 'ai_guide',
              aiGuide: context.rawGuide || null,
              aiGuideAdminEdited: context.adminEdited === true
            }
          );
        const savedId = String(saved?.id || saved?._id || '');
        if (savedId && ['admin', 'teacher'].includes(window.VMOAuth?.getSession?.()?.role)) {
          const context = aiGuideContexts.get(problemId);
          if (context) context.savedGuideId = savedId;
          const actions = document.getElementById(`ai-panel-${problemId}`)?.querySelector('.ai-guide-actions');
          if (actions && !actions.querySelector('.btn-ai-guide-delete')) {
            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'btn-guide-action btn-ai-guide-delete';
            deleteButton.style.color = '#be123c';
            deleteButton.textContent = window.currentLang === 'en' ? '🗑️ Delete saved guide' : '🗑️ Xóa lời giải đã lưu';
            deleteButton.onclick = () => window.deleteSavedAIGuide(problemId);
            actions.appendChild(deleteButton);
          }
        }
        context.adminEdited = false;
        const panel = document.getElementById(`ai-panel-${problemId}`);
        const persistedBadge = panel?.querySelector('.ai-guide-title .ai-guide-persisted-badge');
        if (!persistedBadge && panel) {
          const badge = document.createElement('span');
          badge.className = 'prof-badge ai-guide-persisted-badge';
          badge.style.cssText = 'background:#e0f2fe;color:#075985;';
          badge.textContent = '☁ Đã lưu vào cơ sở dữ liệu';
          panel.querySelector('.ai-guide-title')?.appendChild(badge);
        }
        if (btn) {
          btn.innerHTML = '✅ Đã lưu vào cơ sở dữ liệu!';
          btn.style.color = '#16a34a';
        }
        if (typeof window.showVMOToast === 'function') {
          window.showVMOToast('Đã lưu bài giải thành công vào cơ sở dữ liệu!', true);
        } else {
          alert('Đã lưu bài giải thành công vào cơ sở dữ liệu!');
        }
      } else {
        throw new Error('Dịch vụ lưu trữ chưa sẵn sàng. Vui lòng thử lại sau.');
      }
    } catch (err) {
      console.error('Lỗi khi lưu bài giải AI vào MongoDB:', err);
      if (btn) {
        btn.innerHTML = '⚠️ Lỗi lưu vào cơ sở dữ liệu';
        btn.style.color = '#dc2626';
      }
      alert('Lỗi lưu bài giải: ' + (err.message || 'Không thể ghi vào cơ sở dữ liệu'));
    } finally {
      if (btn) {
        setTimeout(() => {
          btn.disabled = false;
          const context = aiGuideContexts.get(problemId);
          btn.innerHTML = /^[a-f\d]{24}$/i.test(String(context?.savedGuideId || ''))
            ? '💾 Cập nhật lời giải đã lưu'
            : '🚀 Lưu bài giải vào cơ sở dữ liệu';
          btn.style.color = '#0284c7';
        }, 3500);
      }
    }
  };

  window.onAIGuideDeleted = function(savedId) {
    for (const [problemId, context] of aiGuideContexts) {
      if (String(context.savedGuideId) !== String(savedId)) continue;
      const panel = document.getElementById(`ai-panel-${problemId}`);
      const button = panel?.closest('.problem-item, .examplebox, .book-subsection, article')?.querySelector('.btn-ai-guide');
      panel?.remove();
      aiGuideContexts.delete(problemId);
      if (button) {
        button.classList.remove('active');
        button.innerHTML = window.currentLang === 'en'
          ? '<span class="guide-sparkle">✨</span> AI Solution Guide'
          : '<span class="guide-sparkle">✨</span> AI Hướng dẫn giải';
      }
    }
  };

  window.deleteSavedAIGuide = async function(problemId) {
    if (!['admin', 'teacher'].includes(window.VMOAuth?.getSession?.()?.role)) return;
    const context = aiGuideContexts.get(problemId);
    const savedId = String(context?.savedGuideId || '');
    if (!/^[a-f\d]{24}$/i.test(savedId)) return;
    if (!window.confirm('Xóa vĩnh viễn AI Hướng dẫn giải đã lưu trong cơ sở dữ liệu cho câu hỏi này? Bài nộp và đánh giá AI của thành viên được giữ nguyên.')) return;
    const button = document.getElementById(`ai-panel-${problemId}`)?.querySelector('.btn-ai-guide-delete');
    if (button) button.disabled = true;
    try {
      await window.VMODataService.deleteAiGuide(savedId);
      window.onAIGuideDeleted(savedId);
      window.loadLearningDashboard?.();
      window.showVMOToast?.('Đã xóa AI Hướng dẫn giải đã lưu khỏi cơ sở dữ liệu.', true);
    } catch (error) {
      if (button) button.disabled = false;
      window.showVMOToast?.(error?.message || 'Không xóa được lời giải AI.', false);
    }
  };

  // Sao chép nội dung hướng dẫn
  window.copyAIGuideText = function(problemId) {
    const body = document.getElementById(`ai-body-${problemId}`);
    if (!body) return;
    const text = body.innerText;
    const isEn = (window.currentLang === 'en');
    const panel = document.getElementById(`ai-panel-${problemId}`);
    const copyBtn = panel ? panel.querySelector('button[onclick^="copyAIGuideText"]') : null;
    navigator.clipboard.writeText(text).then(() => {
      if (copyBtn) {
        const origHtml = copyBtn.innerHTML;
        copyBtn.innerHTML = isEn ? '✓ Copied to clipboard!' : '✓ Đã sao chép lời giải!';
        copyBtn.style.borderColor = '#16a34a';
        copyBtn.style.color = '#16a34a';
        setTimeout(() => {
          copyBtn.innerHTML = origHtml;
          copyBtn.style.borderColor = '';
          copyBtn.style.color = '';
        }, 2500);
      }
    }).catch(() => {
      if (copyBtn) {
        const origHtml = copyBtn.innerHTML;
        copyBtn.innerHTML = isEn ? 'Please copy manually' : 'Vui lòng chép thủ công';
        setTimeout(() => { copyBtn.innerHTML = origHtml; }, 2500);
      }
    });
  };

  function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  // Keep TeX opaque to Markdown and HTML formatting, including multiline displays.
  function guideMathPattern() {
    return /(?<!\\)\$\$[\s\S]*?(?<!\\)\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|(?<!\\)\$(?!\$)(?:\\[\s\S]|[^$])+?(?<!\\)\$/g;
  }
  function escapeGuideHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function normalizeBareGuideMath(value) {
    const protectedMath = [];
    const protect = math => {
      protectedMath.push(normalizeAlignedTags(math));
      return `\uE100${protectedMath.length - 1}\uE101`;
    };
    const normalizeAlignedTags = math => String(math || '').replace(
      /\\begin\{(aligned\*?|alignedat\*?)\}([\s\S]*?)\\end\{\1\}/g,
      (_, environment, body) => {
        const safeBody = body.replace(/\\tag\*?\{([^{}]*)\}/g, (_, label) => `\\qquad\\text{(${label})}`);
        return `\\begin{${environment}}${safeBody}\\end{${environment}}`;
      }
    );
    const wrapInlineMath = (prefix, formula) => {
      let body = String(formula || '').trim();
      let suffix = '';
      const punctuation = body.match(/[.,;:]+$/)?.[0] || '';
      if (punctuation) { body = body.slice(0, -punctuation.length); suffix = punctuation + suffix; }
      const opens = (body.match(/\(/g) || []).length;
      const closes = (body.match(/\)/g) || []).length;
      if (body.endsWith(')') && closes > opens) { body = body.slice(0, -1); suffix = ')' + suffix; }
      return body ? `${prefix}${protect(`$${body}$`)}${suffix}` : `${prefix}${formula}`;
    };
    let text = String(value || '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      // JSON có thể giữ lại hai dấu gạch chéo trước delimiter MathJax.
      .replace(/\\\\([\[\]()])/g, '\\$1')
      .replace(guideMathPattern(), protect)
      .replace(/\\begin\{(aligned\*?|alignedat\*?|cases|gathered|matrix|pmatrix|bmatrix)\}([\s\S]*?)\\end\{\1\}/g,
        block => protect(`$$${block}$$`));

    // Gemini đôi khi trả TeX đúng cú pháp nhưng quên delimiter MathJax.
    // Bọc nguyên dòng đối với các phép biến đổi/công thức độc lập.
    text = text.split('\n').map(line => {
      const trimmed = line.trim();
      if (!trimmed || /\uE100\d+\uE101/.test(trimmed)) return line;
      const hasLatex = /\\(?:frac|sqrt|sum|prod|lim|tag|infty|to|cdot|times|ge|le|ne|in|forall|Rightarrow|Leftrightarrow)\b/.test(trimmed);
      const startsAsMath = /^(?:\\(?:frac|sqrt|sum|prod|lim|boxed)\b|[+\-]?(?:\d+)?[A-Za-z](?:[A-Za-z0-9_{}^+\-*/.]|\\[A-Za-z]+)*\s*(?:=|>|<|\\(?:ge|le|ne)\b))/.test(trimmed);
      const hasRelation = /(?:=|>|<|\\tag\{|\\to\b|→|≥|≤|≠)/.test(trimmed);
      const hasProse = /[À-ỹ]/.test(trimmed) || /\b(?:therefore|hence|since|because|suppose|then|thus|where|for)\b/i.test(trimmed);
      if (!hasProse && hasRelation && (hasLatex || startsAsMath || /[_^]/.test(trimmed))) return protect(`\\[${trimmed}\\]`);
      return line;
    }).join('\n');

    // Quan hệ dùng lệnh TeX trong câu văn: n\ge1, u_n\to+\infty, x\ne0.
    text = text.replace(/(^|[\s(,;:])([A-Za-z](?:_\{[^{}]+\}|_[A-Za-z0-9]+|\^\{[^{}]+\}|\^[A-Za-z0-9]+)?\s*\\(?:ge|le|ne|to)\s*[+\-]?(?:\\infty|[A-Za-z0-9](?:[A-Za-z0-9_{}^+\-*/.]|\\[A-Za-z]+)*))(?=$|[\s),;:.])/g,
      (_, prefix, formula) => wrapInlineMath(prefix, formula));

    // Danh sách chỉ số có \ldots thường xuất hiện trong phần lời dẫn.
    text = text.replace(/(^|[\s(])((?:\d+\s*,\s*)+\\ldots\s*,\s*[A-Za-z0-9_{}^+\-]+)(?=$|[\s),;:.])/g,
      (_, prefix, formula) => wrapInlineMath(prefix, formula));

    // Bọc các công thức nằm trong câu văn, gồm cả hai vế nhiều hạng tử.
    text = text.replace(/(^|[\s(,;:])((?:\\(?:frac|sqrt)\{[^\n]+|[+\-]?(?:\d+\/)?[A-Za-z0-9](?:[A-Za-z0-9_{}^+\-*/().]|\\[A-Za-z]+)*)(?:\s*(?:=|>|<|≥|≤|≠|→|\\to\b|\\ge\b|\\le\b|\\ne\b)\s*(?:\\(?:frac|sqrt)\{[^\n]+|[+\-]?(?:\d+\/)?[A-Za-z0-9](?:[A-Za-z0-9_{}^+\-*/().]|\\[A-Za-z]+)*))+)(?=$|[\s,;:])/g,
      (_, prefix, formula) => wrapInlineMath(prefix, formula));

    // Các biểu thức chỉ số/số mũ đứng độc lập, ví dụ u_n, u_{n+1}^2.
    text = text.replace(/(^|[\s(,;:])((?:\d+\/)?[A-Za-z](?:_\{[^{}]+\}|_[A-Za-z0-9]+|\^\{[^{}]+\}|\^[A-Za-z0-9]+)(?:[A-Za-z0-9_{}^+\-*/.]|\\[A-Za-z]+)*)(?=$|[\s),;:.])/g,
      (_, prefix, formula) => wrapInlineMath(prefix, formula));

    return text.replace(/\uE100(\d+)\uE101/g, (_, index) => protectedMath[Number(index)] || '');
  }

  function formatMarkdownToHtml(text) {
    if (!text) return '';
    const math = [];
    const protect = formula => { math.push(formula); return `\uE110${math.length - 1}\uE111`; };
    const restore = value => value.replace(/\uE110(\d+)\uE111/g, (_, index) => math[Number(index)]);
    // First preserve formulas while translating legacy prose HTML into Markdown.
    text = String(text).replace(guideMathPattern(), protect)
      .replace(/<br\s*\/?\s*>/gi, '\n')
      .replace(/<\/p\s*>/gi, '\n\n')
      .replace(/<p(?:\s[^>]*)?>/gi, '')
      .replace(/<(?:strong|b)>/gi, '**').replace(/<\/(?:strong|b)>/gi, '**')
      .replace(/<(?:em|i)>/gi, '*').replace(/<\/(?:em|i)>/gi, '*')
      .replace(/<\/?(?:div|span|ul|ol|li)(?:\s[^>]*)?>/gi, '\n');
    const decoded = document.createElement('textarea');
    decoded.innerHTML = text;
    text = normalizeBareGuideMath(restore(decoded.value));
    math.length = 0;
    // Tokenize again after recovering bare TeX. Restore only AFTER all prose transforms.
    text = text.replace(guideMathPattern(), protect)
      // Decode escaped prose line breaks only after math has been protected.
      // A following lowercase letter denotes a TeX command (e.g. \\neq, \\nabla).
      .replace(/(?:\\r\\n|\\n|\\r){2,}/g, '\n\n')
      .replace(/\\(?:r\\n|n|r)(?![a-z])/g, '\n');
    const formatted = escapeGuideHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
    const html = formatted.split(/\n\n+/).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
    return html.replace(/\uE110(\d+)\uE111/g, (_, index) => escapeGuideHtml(math[Number(index)]));
  }

  // TỰ ĐỘNG GẮN NÚT "AI HƯỚNG DẪN GIẢI" VÀO TẤT CẢ CÁC CÂU HỎI TRONG ĐỀ THI
  function injectAIGuideButtons(root = document) {
    // 1. Quét tất cả các bài tập trong thẻ .problem-item (TST và Đề Đà Nẵng - Quảng Nam)
    const problemHeaders = root.querySelectorAll?.('.problem-item .problem-header') || [];
    problemHeaders.forEach(header => {
      if (!header.querySelector('.btn-ai-guide')) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-ai-guide';
        btn.innerHTML = '<span class="guide-sparkle">✨</span> AI Hướng dẫn giải';
        btn.onclick = function() { window.openAIGuide(this); };
        
        // Chèn trước nút copy hoặc cuối header
        const copyBtn = header.querySelector('.btn-copy');
        if (copyBtn) {
          header.insertBefore(btn, copyBtn);
        } else {
          header.appendChild(btn);
        }
      }
    });

    // 2. Quét các câu hỏi trong ví dụ của chuyên đề VMO (.examplebox)
    const exampleBoxes = root.querySelectorAll?.('.examplebox') || [];
    exampleBoxes.forEach(box => {
      const heading = box.querySelector('.box-heading');
      if (heading && !box.querySelector('.btn-ai-guide')) {
        const btnWrap = document.createElement('div');
        btnWrap.style.margin = '8px 0';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-ai-guide';
        btn.innerHTML = '<span class="guide-sparkle">✨</span> AI Hướng dẫn giải';
        btn.onclick = function() { window.openAIGuide(this); };
        btnWrap.appendChild(btn);
        
        const toggleBtn = box.querySelector('.solution-toggle');
        if (toggleBtn) {
          box.insertBefore(btnWrap, toggleBtn);
        } else {
          heading.after(btnWrap);
        }
      }
    });

    // 3. Quét các câu hỏi trong đề thi thử Chương 10, 11, 12, 13
    const unnumberedQuestions = root.querySelectorAll?.('.book-subsection h3.unnumbered') || [];
    unnumberedQuestions.forEach(h3 => {
      const parentSub = h3.closest('.book-subsection');
      if (parentSub && !h3.nextElementSibling?.classList?.contains('ai-btn-wrapper')) {
        const text = h3.innerText.toLowerCase();
        if (text.includes('câu') || text.includes('bài')) {
          const btnWrap = document.createElement('div');
          btnWrap.className = 'ai-btn-wrapper';
          btnWrap.style.margin = '8px 0 12px 0';
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'btn-ai-guide';
          const isEn = (window.currentLang === 'en');
          btn.innerHTML = isEn ? '<span class="guide-sparkle">✨</span> AI Solution Guide' : '<span class="guide-sparkle">✨</span> AI Hướng dẫn giải';
          btn.onclick = function() { window.openAIGuide(this); };
          btnWrap.appendChild(btn);
          h3.after(btnWrap);
        }
      }
    });
  }

  // Cập nhật giao diện khi chuyển đổi ngôn ngữ
  window.addEventListener('langchange', (e) => {
    const isEn = (e.detail?.lang === 'en');
    // Cập nhật tất cả các nút AI Hướng dẫn giải
    document.querySelectorAll('.btn-ai-guide').forEach(btn => {
      const isOpened = btn.classList.contains('active');
      if (isOpened) {
        btn.innerHTML = isEn ? '<span class="guide-sparkle">🙈</span> Hide Guide' : '<span class="guide-sparkle">🙈</span> Ẩn hướng dẫn';
      } else {
        btn.innerHTML = isEn ? '<span class="guide-sparkle">✨</span> AI Solution Guide' : '<span class="guide-sparkle">✨</span> AI Hướng dẫn giải';
      }
    });

    document.querySelectorAll('.btn-ai-guide-refresh').forEach(button=>{button.textContent=isEn?'🔄 Recheck sources / Regenerate':'🔄 Đối chiếu nguồn / Tạo lại';});
    document.querySelectorAll('.btn-ai-guide-redteam').forEach(button=>{if(!button.disabled)button.textContent='🛡️ AI Red Team';});
    document.querySelectorAll('.btn-ai-guide-dna').forEach(button=>{if(!button.disabled)button.textContent='🧬 Math DNA';});

    // Cập nhật tiêu đề trong các panel đang mở
    document.querySelectorAll('.ai-guide-panel').forEach(panel => {
      const titleSpan = panel.querySelector('.ai-guide-title span:first-child');
      if (titleSpan) titleSpan.textContent = isEn ? '🎓 AI Solution Guide' : '🎓 AI Hướng dẫn giải';

      const profBadge = panel.querySelector('.prof-badge');
      if (profBadge) profBadge.textContent = isEn ? 'AI Math Tutor' : 'Gia sư Toán AI';
      const referenceLabel = panel.querySelector('.ai-guide-reference-label');
      if (referenceLabel) referenceLabel.textContent = isEn ? 'Solution references:' : 'Tham chiếu lời giải:';
      const referenceEmpty = panel.querySelector('.ai-guide-reference-empty');
      if (referenceEmpty) referenceEmpty.textContent = isEn ? 'AI Math Tutor generated this solution independently' : 'Gia sư Toán AI tự xây dựng lời giải';

      const copyBtn = panel.querySelector('button[onclick^="copyAIGuideText"]');
      if (copyBtn) copyBtn.textContent = isEn ? '📋 Copy Guide' : '📋 Sao chép hướng dẫn';
      const deleteBtn = panel.querySelector('.btn-ai-guide-delete');
      if (deleteBtn) deleteBtn.textContent = isEn ? '🗑️ Delete saved guide' : '🗑️ Xóa lời giải đã lưu';

      const closeBtn = panel.querySelector('.btn-guide-action:last-child');
      if (closeBtn) closeBtn.textContent = isEn ? '✕ Collapse' : '✕ Thu gọn';

      const s1 = panel.querySelector('.ai-section-knowledge .ai-section-title span');
      if (s1) s1.textContent = isEn ? '🎯 1. Essential Theorems & Lemmas' : '🎯 1. Kiến thức & Bổ đề Chuyên toán cần nắm vững';

      const s2 = panel.querySelector('.ai-section-idea .ai-section-title span');
      if (s2) s2.textContent = isEn ? '💡 2. Key Insights & AI Math Tutor\'s Analysis' : '💡 2. Ý tưởng then chốt & Phân tích của Gia sư Toán AI';

      const s3 = panel.querySelector('.ai-section-solution .ai-section-title span');
      if (s3) s3.textContent = isEn ? '📝 3. Step-by-Step Rigorous Solution (VMO Standard)' : '📝 3. Lời giải chi tiết từng bước (Chuẩn thi HSG Quốc gia)';

      const s4 = panel.querySelector('.ai-section-notes .ai-section-title span');
      if (s4) s4.textContent = isEn ? '⚠️ 4. Common Pitfalls & Scoring Notes' : '⚠️ 4. Sai lầm phổ biến & Lưu ý khi chấm thi';
      const context = aiGuideContexts.get(panel.id.replace('ai-panel-', ''));
      if (context?.rawGuide) {
        if (context.rawGuide.dna) refreshDnaBadge(panel, context.rawGuide.dna);
        if (context.rawGuide.redTeam) refreshRedTeamBadge(panel, context.rawGuide.redTeam);
      }
      if (context?.rawGuide && !context.diagramBusy && panel.dataset.guideEditing !== 'true') {
        mountGuideGeometry(panel, context.rawGuide);
        mountGuideInsights(panel, context.rawGuide);
      }
    });
  });

  // Khởi chạy ngay khi nạp trang
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => injectAIGuideButtons(document.querySelector('.tab-pane.active') || document));
  } else {
    injectAIGuideButtons(document.querySelector('.tab-pane.active') || document);
  }

  // Hỗ trợ tái khởi tạo nếu chuyển tab hoặc thay đổi nội dung
  window.reinitAIGuide = injectAIGuideButtons;
})();
