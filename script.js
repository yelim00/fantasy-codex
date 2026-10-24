
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

// 이미지 업로드 공통 처리
function previewImage(inputId, imageId, placeholderId) {
  const input = $(inputId);
  const image = $(imageId);
  const placeholder = placeholderId ? $(placeholderId) : null;

  if (!input || !image) {
    console.error("이미지 요소를 찾을 수 없습니다:", inputId, imageId);
    return;
  }

  let currentUrl = "";

  input.addEventListener("change", () => {
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일을 선택해 주세요.");
      input.value = "";
      return;
    }

    if (currentUrl) URL.revokeObjectURL(currentUrl);
    currentUrl = URL.createObjectURL(file);

    image.onload = () => {
      image.style.display = "block";
      if (placeholder) placeholder.style.display = "none";
    };

    image.onerror = () => {
      image.style.display = "none";
      if (placeholder) placeholder.style.display = "block";
      alert("이미지를 표시하지 못했어요. 다른 이미지 파일을 선택해 주세요.");
      URL.revokeObjectURL(currentUrl);
      currentUrl = "";
    };

    image.src = currentUrl;
  });
}

// 오른쪽 기록 이미지 요소 준비
function setupRecordImage() {
  const area = $("recordImageArea");
  if (!area) return;

  let image = $("outCardImage");

  if (!image) {
    image = document.createElement("img");
    image.id = "outCardImage";
    image.alt = "도감 이미지";
    image.style.cssText =
      "display:none;width:100%;max-height:180px;object-fit:contain;margin:8px auto;border-radius:8px;";
    area.appendChild(image);
  }

  previewImage("cardImageInput", "outCardImage", null);
}

// 입력 시 미리보기 갱신
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

  const card = $("card");
  const buttons = [$("saveImage"), $("saveImageBottom")];

  try {
    buttons.forEach((button) => {
      if (button) {
        button.disabled = true;
        button.textContent = "이미지 만드는 중...";
      }
    });

    const canvas = await window.html2canvas(card, {
      scale: 2,
      backgroundColor: "#100d18",
      useCORS: true,
      logging: false,
      onclone: (clonedDoc) => {
        const clonedCard = clonedDoc.getElementById("card");
        if (!clonedCard) return;

        Object.assign(clonedCard.style, {
          display: "grid",
          gridTemplateColumns: "42% 58%",
          width: "1200px",
          minWidth: "1200px",
          maxWidth: "1200px",
          height: "675px",
          minHeight: "675px",
          maxHeight: "675px",
          boxSizing: "border-box",
          overflow: "hidden"
        });

        const artwork = clonedCard.querySelector(".artwork");
        if (artwork) {
          artwork.style.height = "675px";
          artwork.style.minHeight = "0";
          artwork.style.overflow = "hidden";
        }

        const record = clonedCard.querySelector(".record");
        if (record) {
          record.style.height = "675px";
          record.style.minHeight = "0";
          record.style.minWidth = "0";
          record.style.boxSizing = "border-box";
          record.style.overflow = "hidden";
          record.style.padding = "20px";
        }

        clonedCard.querySelectorAll("button, .card-image-picker")
          .forEach((item) => item.style.display = "none");
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

$("saveImage")?.addEventListener("click", saveCardAsImage);
$("saveImageBottom")?.addEventListener("click", saveCardAsImage);

// 왼쪽 캐릭터 이미지와 오른쪽 기록 이미지 연결
previewImage("characterImage", "outImage", "imagePlaceholder");
setupRecordImage();

updateCard();

console.log("섀도우 코어 스크립트가 정상 실행되었습니다.");
