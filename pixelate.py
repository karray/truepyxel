import numpy as np
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import io, base64

source_img = None
source_img_gray = None

def img_to_base64(img):
    plt.axis('off')
    plt.imshow(img, cmap='gray')
    buf = io.BytesIO()
    plt.gca().xaxis.set_major_locator(plt.NullLocator())
    plt.gca().yaxis.set_major_locator(plt.NullLocator())
    plt.subplots_adjust(top = 1, bottom = 0, right = 1, left = 0, 
            hspace = 0, wspace = 0)
    plt.savefig(buf, format='png', bbox_inches = 'tight', pad_inches = 0)
    buf.seek(0)
    s = 'data:image/png;base64,' + base64.b64encode(buf.read()).decode('UTF-8')
    buf.close()
    return s

def pixelate_dense(window, pixel):
    global source_img_gray
    n, m = source_img_gray.shape
    w = window*pixel
    n, m = n - n % w, m - m % w
    img = np.zeros((n,m), dtype=source_img_gray.dtype)
    for x in range(0, n, w):
        for y in range(0, m, w):
            p = source_img_gray[x:x+w,y:y+w].mean()
            if p > 1: p = 1
#             if p < .3: p = .3
            if p < .3: p = .0

            dense = np.random.choice([0,1], (window, window), p=(1-p, p))
            for i, d in np.ndenumerate(dense):
                img[x+i[0]*pixel:x+(1+i[0])*pixel,y+i[1]*pixel:y+(1+i[1])*pixel] = d
    
    return img_to_base64(img)

def set_img(str_base64, w, p):
  global source_img
  global source_img_gray
  i = base64.b64decode(str_base64)
  i = io.BytesIO(i)
  source_img = mpimg.imread(i, format='png')
  if source_img.shape[2] == 4:
    source_img = source_img[:, :, :3]
  source_img_gray = np.dot(source_img, [0.299 , 0.587, 0.114])

  return pixelate_dense(w, p)
