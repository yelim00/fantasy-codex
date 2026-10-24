const $ = (id) => document.getElementById(id);

const abilityFields = [
  ["ability1", "desc1"],
  ["ability2", "desc2"],
  ["ability3", "desc3"],
  ["ability4", "desc4"]
];

function valueOr(id, fallback) {
  const field = $(id);
  return field ? field.value.trim() || fallback : fallback;
}

function updateCard() {
  $("outName").textContent = valueOr("characterName", "이름 없는 기록자");
  $("outTitle").textContent = valueOr("title", "미등록 칭호");
  $("outUltimate").textContent = valueOr("ultimate", "미등록 궁극기");
  $("outUltimateDesc").textContent = valueOr("ultimateDesc", "아직 기록된 내용이 없습니다.");
  $("outPet").textContent = valueOr("petName", "미등록 펫");
  $("outPetDesc").textContent = valueOr("petDesc", "아직 기록된 내용이 없습니다.");

  const abilityBox = $("outAbilities");
  abilityBox.innerHTML = "";

  abilityFields.forEach(([nameId, descId], index) => {
    const name = $(nameId).value.trim();
    const desc = $(descId).value.trim();

    if (!name && !desc) return;

    const item = document.createElement("div");
    item.className = "ability";

    const heading = document.createElement("h4");
    heading.textContent = name || `능력 ${index + 1}`;

    const paragraph = document.createElement("p");
    paragraph.textContent = desc || "설명이 없습니다.";

    item.append(heading, paragraph);
    abilityBox.appendChild(item);
  });
}

// 왼쪽에서 고른 캐릭터 이미지를 표시
function setupCharacterImage() {
  const input = $("characterImage");
  const image = $("outImage");
  const placeholder = $("imagePlaceholder");
  let currentUrl = "";

  input.addEventListener("change", () => {
    const file = input.files && input.files[0];
    if (!file) return;

    if (currentUrl) URL.revokeObjectURL(currentUrl);
    currentUrl = URL.createObjectURL(file);

    image.onload = () => {
      image.style.display = "block";
      placeholder.style.display = "none";
    };

    image.onerror = () => {
      image.style.display = "none";
      placeholder.style.display = "block";
      alert("이미지를 표시하지 못했어요. 다른 이미지를 선택해 주세요.");
    };

    image.src = currentUrl;
  });
}

// 오른쪽에서 고른 별도 이미지를 기록 영역에 표시
function setupCardImage() {
  const input = $("cardImageInput");
  let image = $("outCardImage");
  let currentUrl = "";

  // 이미지 표시 공간을 확보
  let area = $("recordImageArea");

  if (!area) {
    area = document.createElement("div");
    area.id = "recordImageArea";
    $("outName").parentNode.insertBefore(area, $("outName").nextSibling);
  }

  input.addEventListener("change", () => {
    const file = input.files && input.files[0];
    if (!file) return;

    if (currentUrl) URL.revokeObjectURL(currentUrl);
    currentUrl = URL.createObjectURL(file);

    if (!image) {
      image = document.createElement("img");
      image.id = "outCardImage";
      image.alt = "도감 이미지";
      image.style.cssText =
        "display:block;width:100%;max-height:240px;object-fit:contain;margin:12px auto;border-radius:8px;";
      area.appendChild(image);
    }

    image.onload = () => {
      image.style.display = "block";
    };

    image.onerror = () => {
      alert("이미지를 표시하지 못했어요. 다른 이미지를 선택해 주세요.");
    };

    image.src = currentUrl;
  });
}

// 텍스트 입력 시 미리보기 갱신
document.querySelectorAll(".editor input, .editor textarea")
  .forEach((field) => {
    if (field.type === "file") return;

    field.addEventListener("input", updateCard);
    field.addEventListener("change", updateCard);
  });

 // PNG 저장
async function saveCardAsImage() {
  updateCard();

  if (typeof window.html2canvas !== "function") {
    alert("이미지 저장 기능을 불러오지 못했어요.");
    return;
  }

  const buttons = [$("saveImage"), $("saveImageBottom")];

  try {
    buttons.forEach((button) => {
      if (button) {
        button.disabled = true;
        button.textContent = "이미지 만드는 중...";
      }
    });

const canvas = await window.html2canvas($("card"), {
  scale: 2,
  backgroundColor: "#100d18",
  useCORS: true,
  logging: true,
  onclone: (clonedDoc) => {
    clonedDoc.querySelectorAll("canvas").forEach((item) => {
      if (item.width === 0 || item.height === 0) {
        item.width = 1;
        item.height = 1;
      }
    });
  }
});

    const filename = valueOr("characterName", "fantasy-record")
      .replace(/[\\/:*?"<>|]/g, "_");

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) resolve(result);
        else reject(new Error("PNG 파일 생성 실패"));
      }, "image/png");
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${filename}-도감.png`;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (error) {
    console.error(error);
    alert("저장 오류: " + error.message);
  } finally {
    buttons.forEach((button) => {
      if (button) {
        button.disabled = false;
        button.textContent = "✧ 이미지 저장";
      }
    });
  }
}


$("saveImage").addEventListener("click", saveCardAsImage);
$("saveImageBottom").addEventListener("click", saveCardAsImage);

setupCharacterImage();
setupCardImage();
updateCard();
console.log("도감 이미지 입력:", $("cardImageInput"));
console.log("도감 이미지 영역:", $("recordImageArea"));
