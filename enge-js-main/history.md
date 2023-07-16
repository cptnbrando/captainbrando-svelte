history.md

2022-11-21: fixed a timing bug in the CD dma, where the dma speed was always single speed. Videos play a whole lot better now.
2022-11-20: -- a whole bucnmh of stuff which i did not add to the history --
2021-03-23: first attempt at caching GTE coordinates and trying to remap them. 3D game look better but problems with rectangular primitives.
            those are commonly used for background tiles and text.
2021-03-12: improved cdrom dma transfer speed, increases FMV performance. 
2021-03-11: removed uRGBA texture and moved logic to shader, less CPU/GPU usage when moving/storing images, should increase FMV performance
            adjusted shaders to use only alpha channel, img.buffer is copied directly to GPU. Total data from CPU -> GPU reduced by factor +/- 6
            as such qoulity-level Q8 is now supported
2021-03-10: added quality selector Q1,Q2,Q4 for higher quality graphics
2021-03-08: added gamepad support and file selection
2021-03-05: adapted recompiler to support level-1 and level-2 loops, substantial increase in performance.
2021-03-04: adapted recompiler to collect statistics  
2021-03-02: fixed a rendering bug by flushing vertices before storing an image. needed for using older clut.  
2021-02-28: root-counter seem to work properly again (toggle and single-shot not yet implemented)  
2021-02-25: started complete rewrite of root-counters  
2021-02-23: removed pressure on mainLoop by pre-fetching branch targets in recompiled code  
2021-02-20: reduced basic constant folding to offsets only  
2021-02-16: added basic constant folding to recompiler  
2021-02-15: starting refactoring recompiler to reduce overhead for mainloop (goal to minimize code lookup should give 10% more performance)  
2021-02-14: refactoring cycle counting to event system (5% performance improvement)  
2021-02-08: initial WebGL2 rendering for faster graphics (mainly due to integer math needed for texture.window) only MDEC video  
