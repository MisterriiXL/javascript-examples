//https://misterriixl.github.io/2022/08/10/multiples-archivos-javascript/

export class Loader {
  constructor(files = []) {
    this.files = files;
  }

  getImageData(jsonFileUrl, jsonResult) {
    const path = jsonFileUrl.split(/\/\w+.json/)[0];
    const imageName = jsonResult.meta.image;
    const key = imageName.replace(".png", "");

    return [key, `${path}/${imageName}`];
  }

  readAll(callback) {
    const promises = this.files.map((jsonFileUrl) => this.read(jsonFileUrl));

    Promise.all(promises).then((values) => {
      const result = {};
      values.forEach((value) => result[value.key] = value);

      callback(result);
    }).catch((error) => console.error(error));
  }

  read(jsonFileUrl) {
    const promise = new Promise((resolve, reject) => {
      this.readJson(jsonFileUrl).then((rawResult) => {
        const jsonResult = JSON.parse(rawResult);
        const [key, imagePath] = this.getImageData(jsonFileUrl, jsonResult);
        this.readImage(imagePath).then((imageResult) => {
          resolve({ jsonResult, imageResult, key });
        }).catch((error) => reject(error));
      }).catch((error) => reject(error));
    });

    return promise;
  }

  readJson(jsonFileUrl) {
    const promise = new Promise((resolve, reject) => {
      const rawFile = new XMLHttpRequest();
      rawFile.overrideMimeType("application/json");
      rawFile.open("GET", jsonFileUrl, true);
      rawFile.onreadystatechange = () => {
        if (rawFile.readyState === 4) {
          if (rawFile.status == "200") {
            resolve(rawFile.responseText);
          } else {
            reject(`Fail to read ${jsonFileUrl}`);
          }
        }
      }
      rawFile.send(null);
    });

    return promise;
  }

  readImage(imageFileUrl) {
    const promise = new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(`Fail to read ${imageFileUrl}`);
      image.src = imageFileUrl;
    });

    return promise;
  }
}
